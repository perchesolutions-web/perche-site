/*
  Monthly summary: on the 1st of each month, emails each fence company what came in through their quote page
  the month before: how many requests, free measures, the estimated value, what homeowners asked for, and a
  list of the requests. A month with no requests gets a short checklist instead.

  Runs on Netlify's schedule, on the published site only. To send it now (for a test), open Netlify →
  Functions → monthly-summary → Run now.

  Needs, in Netlify's environment variables (then a deploy):
    NETLIFY_API_TOKEN   a personal access token (Netlify → User settings → Applications), to read submissions
    RESEND_API_KEY      the same key the request emails use (see submission-created.mjs)
    TQ_EMAIL_COPY       optional: gets a copy of every summary, and replies to the summary go there
    TQ_SUMMARY_MONTH    optional: "2026-10" summarizes that month instead of last month
  Each summary goes to the client's leadEmails (clients/directory.mjs) plus TQ_EMAIL_COPY.
*/
import CLIENTS from "../../clients/directory.mjs";
import { TIMEOUT_MS, clean, email, emails, esc, resendKey, fromAddress, sendEmail, WRAP, MUTED, table, textRows } from "../lib/common.mjs";

const API = "https://api.netlify.com/api/v1";
const TZ = "America/New_York";
const MAX_PAGES = 20;   // up to 2,000 submissions read per form per run
const LIST_MAX = 25;    // requests listed in one email
const AT_ONCE = 4;      // clients handled at the same time, to stay inside the 30-second limit

export default async () => {
  const env = process.env;
  const token = String(env.NETLIFY_API_TOKEN || "").trim();
  const site = String(env.TQ_SITE_ID || env.SITE_ID || "").trim();
  if (!token || !site) return done("not sent: set NETLIFY_API_TOKEN in Netlify first");
  const key = resendKey(env);
  if (!key) return done("not sent: Resend isn't set up");
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(env.TQ_SUMMARY_MONTH || "") ? env.TQ_SUMMARY_MONTH : lastMonth(new Date());
  let forms;
  try { forms = await api(token, "/sites/" + encodeURIComponent(site) + "/forms"); } catch (e) { return done(month + ": couldn't list forms (" + e.message + ")"); }
  const byName = new Map((Array.isArray(forms) ? forms : []).map((f) => [f.name, f]));
  const ids = Object.keys(CLIENTS);
  const results = await pool(ids, AT_ONCE, async (id) => id + ": " + await summarize(id, CLIENTS[id], byName.get("lead-" + id), month, token, key, env));
  return done(month + ": " + (results.join("; ") || "no clients"));
};

// 13:00 UTC on the 1st is 8 or 9 a.m. in Miami.
export const config = { schedule: "0 13 1 * *" };

function done(outcome) {
  console.log("monthly-summary: " + outcome);
  return new Response("ok");
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (next < items.length) { const k = next++; out[k] = await fn(items[k]); }
  }));
  return out;
}

async function api(token, path) {
  const r = await fetch(API + path, {
    headers: { Authorization: "Bearer " + token, "User-Agent": "TraceQuote monthly summary (hello@perchesolutions.com)" },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!r.ok) throw new Error("Netlify API " + r.status);
  return r.json();
}

async function summarize(id, co, form, month, token, key, env) {
  const to = emails((co.leadEmails || []).concat(emails(env.TQ_EMAIL_COPY)));
  if (!to.length) return "skipped (no one to send it to)";
  if (!form) return "skipped (no lead-" + id + " form yet)";
  let subs;
  try { subs = await submissionsIn(form.id, month, token); } catch (e) { return "couldn't read requests (" + e.message + ")"; }
  const s = stats(subs);
  const msg = summaryEmail(co, month, s);
  const r = await sendEmail(key, {
    from: "TraceQuote <" + fromAddress(env) + ">", to, subject: msg.subject, html: msg.html, text: msg.text,
    reply_to: email(env.TQ_EMAIL_COPY) || undefined
  });
  return s.requests + " request" + (s.requests === 1 ? "" : "s") + ", " + r;
}

// Submissions come newest first, 100 to a page: stop at the first page that's entirely before the month.
async function submissionsIn(formId, month, token) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const list = await api(token, "/forms/" + encodeURIComponent(formId) + "/submissions?per_page=100&page=" + page);
    if (!Array.isArray(list) || !list.length) break;
    let older = 0;
    for (const s of list) {
      const m = monthOf(s && s.created_at);
      if (m === month) out.push(s);
      else if (m && m < month) older++;
    }
    const newestFirst = String(list[0].created_at) >= String(list[list.length - 1].created_at);
    if (list.length < 100 || (newestFirst && older === list.length)) break;
  }
  return out;
}

const MONTH_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
function monthOf(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d)) return "";
  const p = MONTH_FMT.formatToParts(d);
  return p.find((x) => x.type === "year").value + "-" + p.find((x) => x.type === "month").value;
}
function lastMonth(now) {
  const [y, m] = monthOf(now.toISOString()).split("-").map(Number);
  return m === 1 ? (y - 1) + "-12" : y + "-" + String(m - 1).padStart(2, "0");
}
function monthName(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
function dayLabel(iso) { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: TZ }); }
function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }

// "$6,750–$9,600" -> [6750, 9600]; "From $5,700" -> [5700, 5700]; "Not shown" -> null.
function range(s) {
  const n = String(s || "").match(/\$[\d,]+/g);
  if (!n) return null;
  const v = n.map((x) => Number(x.replace(/[$,]/g, ""))).filter((x) => isFinite(x) && x > 0);
  return v.length ? [v[0], v[v.length - 1]] : null;
}
// "176 ft of 6 ft vinyl privacy, white" -> "6 ft vinyl privacy"
function style(f) { const m = String(f || "").match(/ of (\d+ ft [a-z ]+?)\s*(?:,|\(|$)/i); return m ? m[1].trim().toLowerCase() : ""; }

function stats(subs) {
  const fresh = subs.filter((s) => !/measure time/i.test(String((s.data || {}).update || "")));
  let lo = 0, hi = 0, priced = 0;
  const styles = new Map();
  for (const s of fresh) {
    const d = s.data || {};
    const r = range(d.price_estimate) || range(d.price_shown);
    if (r) { lo += r[0]; hi += r[1]; priced++; }
    const st = style(d.fence);
    if (st) styles.set(st, (styles.get(st) || 0) + 1);
  }
  return {
    requests: fresh.length,
    measures: fresh.filter((s) => (s.data || {}).wants === "Free measure").length,
    times: subs.filter((s) => clean((s.data || {}).measure_visit, 60, true)).length,
    asap: fresh.filter((s) => /as soon as possible/i.test(String((s.data || {}).install_timing || ""))).length,
    texts: fresh.filter((s) => /^yes$/i.test(String((s.data || {}).text_consent || ""))).length,
    lo, hi, priced,
    top: [...styles].sort((a, b) => b[1] - a[1]).slice(0, 4),
    list: fresh.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  };
}

function summaryEmail(co, month, s) {
  const company = clean(co.name, 80, true), when = monthName(month);
  if (!s.requests) {
    const subject = when + " on your quote page: no requests yet";
    const steps = [
      "Your “Get an instant quote” button sits near the top of your homepage.",
      "Your Google Business Profile links to your quote page.",
      "You send your quote page link when someone calls or texts for a price."
    ];
    const html = "<div " + WRAP + ">" +
      '<p style="margin:0;font-size:13px;color:#5b6b63">' + esc(company) + "</p>" +
      '<h1 style="margin:2px 0 10px;font-size:20px;line-height:1.3">No quote requests in ' + esc(when) + "</h1>" +
      "<p style=\"margin:0\">No homeowner sent a request through your quote page in " + esc(when) + ". Three things to check:</p>" +
      '<ol style="margin:8px 0 0;padding-left:20px">' + steps.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol>" +
      '<p style="margin:14px 0 0">Reply to this email and we’ll look at your setup with you.</p>' +
      "<p " + MUTED + ">TraceQuote monthly summary for " + esc(company) + ".</p></div>";
    const text = "No quote requests in " + when + "\n\nNo homeowner sent a request through your quote page in " + when + ". Three things to check:\n" +
      steps.map((x, i) => (i + 1) + ". " + x).join("\n") + "\n\nReply to this email and we'll look at your setup with you.";
    return { subject, html, text };
  }
  const plural = (n, one, many) => n + " " + (n === 1 ? one : many);
  const subject = when + " on your quote page: " + plural(s.requests, "quote request", "quote requests");
  const value = s.priced ? (s.lo === s.hi ? money(s.lo) : money(s.lo) + "–" + money(s.hi)) : "";
  const big = [["Quote requests", String(s.requests)], ["Free measures asked for", String(s.measures)]].concat(value ? [["Estimated value", value]] : []);
  const rows = [];
  if (s.top.length) rows.push(["Most asked for", s.top.map((t) => t[0] + " (" + t[1] + ")").join(", ")]);
  if (s.times) rows.push(["Measure times picked", String(s.times)]);
  rows.push(["Wanted it as soon as possible", String(s.asap)]);
  rows.push(["Agreed to texts", String(s.texts)]);
  const shown = s.list.slice(0, LIST_MAX);
  const cell = 'style="padding:6px 10px 6px 0;border-top:1px solid #dde3df;vertical-align:top"';
  const head = 'style="padding:6px 10px 6px 0;text-align:left;font-weight:normal;color:#5b6b63;font-size:13px"';
  const listHtml = '<table role="presentation" style="border-collapse:collapse;width:100%;margin:8px 0 0;font-size:14px"><tr>' +
    ["Date", "Homeowner", "Fence", "Estimate"].map((h) => "<th " + head + ">" + h + "</th>").join("") + "</tr>" +
    shown.map((x) => {
      const d = x.data || {};
      const town = clean(String(d.address || "").split(",")[1] || "", 40, true);
      const who = clean(d.name, 40, true) || "Homeowner";
      const r = range(d.price_estimate) || range(d.price_shown);
      return "<tr><td " + cell + ">" + esc(dayLabel(x.created_at)) + "</td><td " + cell + ">" + esc(who) + (town ? '<br><span style="color:#5b6b63">' + esc(town) + "</span>" : "") +
        (d.wants === "Free measure" ? '<br><span style="color:#5b6b63">Free measure</span>' : "") + "</td><td " + cell + ">" + esc(clean(d.fence, 80, true)) +
        "</td><td " + cell + ' style="white-space:nowrap">' + esc(r ? (r[0] === r[1] ? money(r[0]) : money(r[0]) + "–" + money(r[1])) : "") + "</td></tr>";
    }).join("") + "</table>" +
    (s.list.length > shown.length ? '<p style="margin:6px 0 0;font-size:13px;color:#5b6b63">And ' + (s.list.length - shown.length) + " more in Netlify.</p>" : "");
  const cells = big.map((b) => '<td style="padding:10px 14px 10px 0;vertical-align:top"><div style="font-size:24px;font-weight:bold;line-height:1.2">' + esc(b[1]) +
    '</div><div style="font-size:13px;color:#5b6b63">' + esc(b[0]) + "</div></td>").join("");
  const html = "<div " + WRAP + ">" +
    '<p style="margin:0;font-size:13px;color:#5b6b63">' + esc(company) + "</p>" +
    '<h1 style="margin:2px 0 6px;font-size:20px;line-height:1.3">Your quote page in ' + esc(when) + "</h1>" +
    '<table role="presentation" style="border-collapse:collapse"><tr>' + cells + "</tr></table>" +
    table(rows) +
    '<h2 style="margin:20px 0 0;font-size:16px">The requests</h2>' + listHtml +
    "<p " + MUTED + ">Each request was emailed to you when it came in. Estimated value adds up the price ranges your page worked out for these requests; it isn’t a forecast of jobs won. New prices or questions? Reply to this email.</p></div>";
  const text = "Your quote page in " + when + " (" + company + ")\n\n" + textRows(big.concat(rows)) + "\n\nThe requests:\n" +
    shown.map((x) => {
      const d = x.data || {}, r = range(d.price_estimate) || range(d.price_shown);
      return "- " + dayLabel(x.created_at) + ", " + (clean(d.name, 40, true) || "Homeowner") + ": " + clean(d.fence, 80, true) + (r ? ", " + (r[0] === r[1] ? money(r[0]) : money(r[0]) + "–" + money(r[1])) : "");
    }).join("\n") + (s.list.length > shown.length ? "\nAnd " + (s.list.length - shown.length) + " more in Netlify." : "") +
    "\n\nEach request was emailed to you when it came in. New prices or questions? Reply to this email.";
  return { subject, html, text };
}
