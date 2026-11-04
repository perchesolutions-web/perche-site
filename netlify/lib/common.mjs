/*
  Helpers shared by the Netlify functions (netlify/functions/*). Not a function itself, and not served:
  /netlify/* returns the 404 page on the live site.
*/
export const TIMEOUT_MS = 8000;
export const DEFAULT_FROM = "quotes@perchesolutions.com";
const MAX_EMAILS = 6;

// Homeowners type names and addresses, so keep them short, on one line, and free of links: these messages go
// out under TraceQuote's name, and a link in one would look like ours. Texts also get plain punctuation, which
// keeps them in the cheaper GSM character set; emails keep the original punctuation.
export function clean(s, max, keepPunctuation) {
  let t = String(s == null ? "" : s)
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ")
    .replace(/https?:\/\/\S*/gi, " ")
    .replace(/\bwww\.\S*/gi, " ")
    .replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|info|biz|io|co|us|me|ly|gl|gd|link|xyz|top|site|online|app|club|shop|live|click|ru|cn|tk)\b\S*/gi, " ");
  if (!keepPunctuation) {
    t = t.replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u2018\u2019\u201a\u2032]/g, "'")
      .replace(/[\u201c\u201d\u201e\u2033]/g, '"')
      .replace(/\u2026/g, "...");
  }
  return t.replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

// A US number as +1 and 10 digits, or "" if it isn't one.
export function e164(s) {
  let d = String(s == null ? "" : s).replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? "+1" + d : "";
}

const EMAIL = /^[^\s@<>",;:()\[\]\\]+@[^\s@<>",;:()\[\]\\]+\.[a-z]{2,}$/i;
export function email(s) { const e = String(s == null ? "" : s).trim(); return e.length <= 254 && EMAIL.test(e) ? e : ""; }
// Valid addresses from a list or a comma-separated string, without repeats, at most six.
export function emails(list) {
  const out = [];
  (Array.isArray(list) ? list : String(list == null ? "" : list).split(/[,;\s]+/)).forEach((x) => {
    const e = email(x);
    if (e && !out.some((o) => o.toLowerCase() === e.toLowerCase()) && out.length < MAX_EMAILS) out.push(e);
  });
  return out;
}

export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
// A sender name that needs no escaping in the From line.
export function display(s) { return '"' + clean(s, 80, true).replace(/["\\]/g, "") + '"'; }

export function resendKey(env) { const k = String(env.RESEND_API_KEY || ""); return /^re_[A-Za-z0-9_]{8,}$/.test(k) ? k : ""; }
export function fromAddress(env) { return email(env.TQ_EMAIL_FROM) || DEFAULT_FROM; }

// Sends one email through Resend. Returns "sent" or why not, with any email address in Resend's reason hidden.
export async function sendEmail(key, msg) {
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify(msg),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (r.ok) return "sent";
    const j = await r.json().catch(() => ({}));
    const why = String(j.message || j.error || "").replace(/[^\s@<>"]+@[^\s@<>"]+/g, "[email]").slice(0, 160);
    return "not sent (Resend " + (j.statusCode || r.status) + (why ? ": " + why : "") + ")";
  } catch (e) {
    return "not sent (" + (e && (e.name === "TimeoutError" || e.name === "AbortError") ? "Resend didn't answer in time" : e && e.message) + ")";
  }
}

// Email layout pieces: plain inline styles that hold up in Gmail, Outlook and phone mail apps.
export const WRAP = 'style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#16221c;max-width:560px"';
export const MUTED = 'style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#5b6b63"';
// rows: [label, value] pairs; a third item marks the value as HTML that's already escaped.
export function table(rows) {
  return '<table role="presentation" style="border-collapse:collapse;width:100%;margin:8px 0 0">' + rows.map((r) =>
    '<tr><td style="padding:7px 12px 7px 0;border-top:1px solid #dde3df;color:#5b6b63;vertical-align:top;white-space:nowrap">' + esc(r[0]) +
    '</td><td style="padding:7px 0;border-top:1px solid #dde3df;vertical-align:top">' + (r[2] ? r[1] : esc(r[1])) + "</td></tr>").join("") + "</table>";
}
export function textRows(rows) { return rows.map((r) => r[0] + ": " + (r[2] ? r[2] : r[1])).join("\n"); }
