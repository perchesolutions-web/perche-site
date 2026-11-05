/*
  Runs each time Netlify accepts a form submission. Netlify signs these calls and checks the signature
  before running this, so nobody can trigger it from outside.

  - A homeowner sends a request on a fence company's quote page (form "lead-<client id>"):
      * text the company, so they can call while the homeowner is still looking;
      * email the request to the company (with a copy to TraceQuote), so nobody has to set up a Netlify
        email notification for each client;
      * email the homeowner a confirmation with the company's name and number.
  - A fence company asks for text alerts on the setup form (form "client-setup"):
    text them a confirmation that they signed up (carriers require one).

  Each part does nothing until its settings are in Netlify (Site configuration > Environment variables)
  and the site has been deployed again:

  Texts (Twilio)
    TWILIO_ACCOUNT_SID            starts with AC
    TWILIO_AUTH_TOKEN             or TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET
    TWILIO_MESSAGING_SERVICE_SID  starts with MG: the Messaging Service on the approved A2P 10DLC campaign
                                  (TWILIO_FROM_NUMBER works instead, but carriers block unregistered numbers)
    TQ_TEXT_<CLIENT ID>           who gets that company's alerts: up to 3 numbers, separated by commas.
                                  The client id in capitals with dashes as underscores, for example
                                  TQ_TEXT_ACME_FENCE = 305-555-0123, 786-555-0100
                                  The numbers live in Netlify rather than in this public repository.
  Emails (Resend)
    RESEND_API_KEY                starts with re_; the domain in TQ_EMAIL_FROM must be verified in Resend
    TQ_EMAIL_FROM                 optional, the sending address (default quotes@perchesolutions.com)
    TQ_EMAIL_COPY                 optional, gets a copy of every request email (for example your Gmail)
    Who gets each company's requests comes from leadEmails in clients/<id>.json, collected in
    clients/directory.mjs by tools/new-client.mjs.
*/
import CLIENTS from "../../clients/directory.mjs";
import { TIMEOUT_MS, clean, e164, email, emails, esc, display, resendKey, fromAddress, sendEmail, WRAP, MUTED, table, textRows } from "../lib/common.mjs";

const MAX_NUMBERS = 3;

export default async (req) => {
  let body;
  try { body = await req.json(); } catch (e) { return done("ignored: not JSON"); }
  const p = (body && body.payload) || body || {};
  const data = p.data || {};
  const form = String(p.form_name || data["form-name"] || "");
  try {
    if (form.startsWith("lead-")) {
      const id = form.slice(5);
      if (!/^[a-z0-9-]{1,40}$/.test(id)) return done("ignored: bad client id");
      const results = await Promise.all([leadAlert(id, data, process.env), leadEmails(id, data, process.env)]);
      return done(results.join(" | "));
    }
    if (form === "client-setup") return done(await setupConfirmation(data, process.env));
  } catch (e) {
    return done("error: " + (e && e.message));
  }
  return done("ignored: form " + (form || "(none)"));
};

function done(outcome) {
  console.log("submission-created: " + outcome);
  return new Response("ok");
}

/* ---------- Texts (Twilio) ---------- */

async function leadAlert(id, d, env) {
  const to = numbers(env[alertVar(id)]);
  if (!to.length) return id + ": no " + alertVar(id) + " set, so no text";
  const text = leadMessage(d);
  const results = await Promise.all(to.map((n) => sendText(env, n, text)));
  return id + ": " + results.join("; ");
}

async function setupConfirmation(d, env) {
  if (!/^yes$/i.test(String(d.alert_consent || ""))) return "setup: no text alerts asked for";
  if (!String(d.alert_phone || "").trim()) return "setup: no alert number";
  const to = e164(d.alert_phone);
  if (!to) return "setup: alert number isn't a valid US number";
  const company = clean(d.company, 60);
  const first = "TraceQuote: You're signed up for quote request alerts" + (company ? " for " + company : "");
  const text = first + (/\.$/.test(first) ? "" : ".") +
    " Once your quote page is live, you'll get a text for each new request. Msg frequency varies. " +
    "Msg & data rates may apply. Reply HELP for help, STOP to cancel.";
  return "setup: " + await sendText(env, to, text);
}

// The environment variable that holds a client's alert numbers: acme-fence -> TQ_TEXT_ACME_FENCE.
function alertVar(id) { return "TQ_TEXT_" + String(id).toUpperCase().replace(/-/g, "_"); }

function leadMessage(d) {
  const update = isUpdate(d);
  const head = update ? "Measure time picked" : d.wants === "Free measure" ? "New free measure request" : "New quote request";
  const lines = ["TraceQuote: " + head];
  lines.push([clean(d.name, 40) || "Homeowner", clean(d.phone, 20)].filter(Boolean).join(", "));
  const address = clean(d.address, 80);
  if (address && !/^not given/i.test(address)) lines.push(address);
  if (!update) {
    const fence = clean(shortFence(d.fence), 80);
    const extras = [];
    const gates = clean(d.gates, 30);
    if (gates && !/^none$/i.test(gates)) extras.push(gates);
    if (/^yes$/i.test(String(d.old_fence_removal || ""))) extras.push("old fence removal");
    const site = clean(d.site_conditions, 60);
    if (site && !/^none/i.test(site)) extras.push(site);
    if (fence) lines.push([fence].concat(extras).join(", "));
    // A company can show a range, a starting price ("From $6,750") or no price; the estimate always comes along.
    const price = clean(d.price_shown, 30), estimate = clean(d.price_estimate, 30);
    if (/^not shown/i.test(price)) lines.push(estimate ? "Estimate " + estimate + " (no price shown to them)" : "No price shown to them");
    else if (price) lines.push("Saw " + price.replace(/^From /, "from "));
    const timing = clean(d.install_timing, 30);
    if (timing && !/^not given$/i.test(timing)) lines.push("Timing: " + timing);
  }
  const measure = clean(d.measure_visit, 40);
  if (measure) lines.push("Measure: " + measure);
  lines.push("Reply STOP to end alerts");
  return lines.join("\n");
}

function isUpdate(d) { return /measure time/i.test(String(d.update || "")); }
function shortFence(s) { return String(s || "").replace(/\s*\(length typed in by the homeowner, not traced\)/i, " (length typed in, not traced)"); }

function numbers(s) {
  const out = [];
  String(s == null ? "" : s).split(/[,;\n]+/).forEach((part) => {
    const n = e164(part);
    if (n && out.indexOf(n) < 0 && out.length < MAX_NUMBERS) out.push(n);
  });
  return out;
}

async function sendText(env, to, text) {
  const sid = String(env.TWILIO_ACCOUNT_SID || "");
  const user = env.TWILIO_API_KEY_SID || sid;
  const secret = env.TWILIO_API_KEY_SECRET || env.TWILIO_AUTH_TOKEN || "";
  const service = String(env.TWILIO_MESSAGING_SERVICE_SID || "");
  const from = e164(env.TWILIO_FROM_NUMBER);
  if (!/^AC[0-9a-f]{32}$/i.test(sid) || !secret || !(/^MG[0-9a-f]{32}$/i.test(service) || from)) return "not sent to " + mask(to) + " (Twilio isn't set up)";
  const form = new URLSearchParams({ To: to, Body: text });
  if (service) form.set("MessagingServiceSid", service);
  else form.set("From", from);
  try {
    const r = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + sid + "/Messages.json", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(user + ":" + secret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (r.ok) return "sent to " + mask(to);
    const j = await r.json().catch(() => ({}));
    const why = String(j.message || "").replace(/\+?\d[\d\s().-]{6,}\d/g, "[number]").slice(0, 160);
    return "not sent to " + mask(to) + " (Twilio " + (j.code || r.status) + (why ? ": " + why : "") + ")";
  } catch (e) {
    return "not sent to " + mask(to) + " (" + (e && (e.name === "TimeoutError" || e.name === "AbortError") ? "Twilio didn't answer in time" : e && e.message) + ")";
  }
}

// Logs show which number got a text without writing the whole number down.
function mask(n) { return n.slice(0, 5) + "***" + n.slice(-2); }

/* ---------- Emails (Resend) ---------- */

async function leadEmails(id, d, env) {
  const key = resendKey(env);
  if (!key) return "emails: not sent (Resend isn't set up)";
  const co = CLIENTS[id];
  if (!co) return "emails: " + id + " isn't in clients/directory.mjs";
  const sender = fromAddress(env);
  const homeowner = email(d.email);
  const out = [];

  const team = emails((co.leadEmails || []).concat(emails(env.TQ_EMAIL_COPY)));
  if (team.length) {
    const msg = companyEmail(co, d);
    const r = await sendEmail(key, {
      from: "TraceQuote <" + sender + ">", to: team, subject: msg.subject, html: msg.html, text: msg.text,
      reply_to: homeowner || undefined
    });
    out.push("request to " + team.length + " address" + (team.length === 1 ? "" : "es") + ": " + r);
  } else out.push("request: no leadEmails for " + id);

  if (homeowner) {
    const msg = homeownerEmail(co, d);
    const companyReply = email(co.email) || (co.leadEmails || []).map(email).filter(Boolean)[0] || "";
    const r = await sendEmail(key, {
      from: display(co.name + " via TraceQuote") + " <" + sender + ">", to: [homeowner], subject: msg.subject,
      html: msg.html, text: msg.text, reply_to: companyReply || undefined
    });
    out.push("confirmation to homeowner: " + r);
  } else out.push("confirmation: no valid homeowner email");
  return "emails: " + out.join("; ");
}

// Links in a request come from the quote tool, but a form can be posted by anyone, so only known kinds pass.
function safeLink(url, kind) {
  const u = String(url || "").trim();
  const ok = {
    map: /^https:\/\/api\.mapbox\.com\/styles\/v1\/[^\s"<>]+$/,
    directions: /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=[^\s"<>]+$/,
    page: /^https:\/\/(perchesolutions\.com|[a-z0-9-]+--perchesolutions\.netlify\.app)\/[^\s"<>]*$/
  }[kind];
  return ok && ok.test(u) && u.length < 4000 ? u : "";
}
function origin(s) { const o = String(s || "").trim(); return /^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(o) && o.length < 200 ? o : ""; }
function telLink(s) { const n = e164(s); return n ? '<a href="tel:' + n + '">' + esc(clean(s, 20, true)) + "</a>" : esc(clean(s, 20, true)); }
function firstName(s) { return clean(s, 40, true).split(" ")[0] || ""; }

// The request, for the fence company. Replying reaches the homeowner.
function companyEmail(co, d) {
  const update = isUpdate(d);
  const name = clean(d.name, 60, true) || "Homeowner";
  const phone = clean(d.phone, 20, true), mail = email(d.email);
  const head = update ? "Measure time added" : d.wants === "Free measure" ? "New free measure request" : "New quote request";
  const subject = clean(d.subject, 160, true) || head + ": " + name;
  const price = clean(d.price_shown, 40, true), estimate = clean(d.price_estimate, 40, true);
  const rows = [];
  const address = clean(d.address, 120, true);
  if (address) rows.push(["Address", address]);
  if (!update) {
    rows.push(["Asked for", clean(d.wants, 40, true) || "Detailed quote"]);
    if (d.fence) rows.push(["Fence", clean(d.fence, 160, true)]);
    if (d.gates) rows.push(["Gates", clean(d.gates, 60, true)]);
    if (d.old_fence_removal) rows.push(["Old fence removal", clean(d.old_fence_removal, 10, true)]);
    const site = clean(d.site_conditions, 160, true);
    if (site && !/^none/i.test(site)) rows.push(["Yard conditions", site]);
    const corners = parseInt(d.corners, 10);
    if (corners > 0) rows.push(["Corners", String(corners)]);
    if (/^not shown/i.test(price)) rows.push(["Price shown", "None (your page doesn’t show prices)"]);
    else if (price) rows.push(["Price shown", price]);
    if (estimate && estimate !== price) rows.push(["Estimate", estimate]);
    const monthly = clean(d.monthly_shown, 40, true);
    if (monthly) rows.push(["Monthly shown", monthly]);
    const timing = clean(d.install_timing, 40, true);
    if (timing) rows.push(["Install timing", timing]);
  }
  const measure = clean(d.measure_visit, 60, true);
  if (measure) rows.push(["Measure time", measure]);
  const texts = /^yes$/i.test(String(d.text_consent || ""));
  rows.push(["Texts", texts ? "Agreed to texts: “" + clean(d.consent_text, 400, true) + "”" : "Didn’t agree to texts. Call or email instead."]);
  const map = safeLink(d.map_image, "map"), dir = safeLink(d.directions, "directions"), page = safeLink(d.page, "page"), from = origin(d.embedded_on);
  const links = [];
  if (map) links.push('<a href="' + esc(map) + '">Satellite picture of the fence</a>');
  if (dir) links.push('<a href="' + esc(dir) + '">Directions</a>');
  const contact = [phone ? telLink(phone) : "", mail ? '<a href="mailto:' + esc(mail) + '">' + esc(mail) + "</a>" : ""].filter(Boolean).join(" &nbsp;·&nbsp; ");
  const html = "<div " + WRAP + ">" +
    '<p style="margin:0;font-size:13px;color:#5b6b63">From your TraceQuote quote page, ' + esc(co.name) + "</p>" +
    '<h1 style="margin:2px 0 10px;font-size:20px;line-height:1.3">' + esc(head) + "</h1>" +
    '<p style="margin:0"><b>' + esc(name) + "</b>" + (contact ? "<br>" + contact : "") + "</p>" +
    table(rows) +
    (links.length ? '<p style="margin:14px 0 0">' + links.join(" &nbsp;·&nbsp; ") + "</p>" : "") +
    "<p " + MUTED + ">" + (mail ? "Reply to this email to reach " + esc(firstName(name) || name) + ". " : "") +
    (page ? "Sent from " + esc(page) + (from ? " on " + esc(from) : "") + "." : "") + "</p></div>";
  const text = head + "\n\n" + name + (phone ? "\n" + phone : "") + (mail ? "\n" + mail : "") + "\n\n" + textRows(rows) +
    (map ? "\n\nSatellite picture: " + map : "") + (dir ? "\nDirections: " + dir : "") +
    (mail ? "\n\nReply to this email to reach " + (firstName(name) || name) + "." : "");
  return { subject, html, text };
}

// The confirmation, for the homeowner. Replying reaches the fence company.
function homeownerEmail(co, d) {
  const update = isUpdate(d);
  const company = clean(co.name, 80, true);
  const first = firstName(d.name);
  const measureAsk = d.wants === "Free measure";
  const subject = update ? "Your measure time with " + company : measureAsk ? "Your free measure request to " + company : "Your fence quote request to " + company;
  const hi = first ? "Thanks, " + first + "." : "Thanks.";
  const lead = update ? hi + " Your measure time is in." : hi + " " + company + " has your request.";
  const phone = clean(d.phone, 20, true), mail = email(d.email);
  const rows = [];
  const address = clean(d.address, 120, true);
  if (address && !/^not given/i.test(address)) rows.push(["Address", address]);
  if (!update) {
    const parts = [clean(d.fence, 160, true)];
    const gates = clean(d.gates, 60, true);
    if (gates && !/^none$/i.test(gates)) parts.push(gates);
    if (/^yes$/i.test(String(d.old_fence_removal || ""))) parts.push("old fence removal");
    if (parts[0]) rows.push(["Fence", parts.join(", ")]);
    const price = clean(d.price_shown, 40, true);
    if (price && !/^not shown/i.test(price)) rows.push([/^from /i.test(price) ? "Starting price" : "Your estimate", price]);
  }
  const measure = clean(d.measure_visit, 60, true);
  if (measure) rows.push(["Measure time", measure + " (" + company + " will confirm it)"]);
  const coPhone = clean(co.phone, 20, true);
  const noPrice = /^not shown/i.test(String(d.price_shown || ""));
  const note = noPrice ? company + " will send your price and confirm it after measuring on site."
    : "Prices are estimates from a satellite measurement. " + company + " confirms the final price after measuring on site.";
  const reach = [phone, mail].filter(Boolean).join(" or ");
  const html = "<div " + WRAP + ">" +
    '<h1 style="margin:0 0 10px;font-size:20px;line-height:1.3">' + esc(lead) + "</h1>" +
    (reach ? '<p style="margin:0">They’ll reach you at ' + esc(reach) + ".</p>" : "") +
    table(rows) +
    '<p style="margin:14px 0 0">Questions? ' + (coPhone ? "Call " + esc(company) + " at " + telLink(coPhone) + ", or reply to this email." : "Reply to this email.") + "</p>" +
    "<p " + MUTED + ">" + esc(note) + "</p>" +
    "<p " + MUTED + ">Sent by TraceQuote for " + esc(company) + ", because you asked for a fence quote on their website.</p></div>";
  const text = lead + (reach ? "\nThey'll reach you at " + reach + "." : "") + "\n\n" + textRows(rows) + "\n\n" +
    "Questions? " + (coPhone ? "Call " + company + " at " + coPhone + ", or reply to this email." : "Reply to this email.") + "\n\n" +
    note + "\n\nSent by TraceQuote for " + company + ", because you asked for a fence quote on their website.";
  return { subject, html, text };
}
