/*
  Runs each time Netlify accepts a form submission. Netlify signs these calls and checks the signature
  before running this, so nobody can trigger it from outside.

  - A homeowner sends a request on a fence company's quote page (form "lead-<client id>"):
    text the company, so they can call while the homeowner is still looking.
  - A fence company asks for text alerts on the setup form (form "client-setup"):
    text them a confirmation that they signed up (carriers require one).

  Nothing is sent until these are set in Netlify (Site configuration > Environment variables) and the site
  has been deployed again:
    TWILIO_ACCOUNT_SID            starts with AC
    TWILIO_AUTH_TOKEN             or TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET
    TWILIO_MESSAGING_SERVICE_SID  starts with MG: the Messaging Service on the approved A2P 10DLC campaign
                                  (TWILIO_FROM_NUMBER works instead, but carriers block unregistered numbers)
    TQ_TEXT_<CLIENT ID>           who gets that company's alerts: up to 3 numbers, separated by commas.
                                  The client id in capitals with dashes as underscores, for example
                                  TQ_TEXT_ACME_FENCE = 305-555-0123, 786-555-0100
  The numbers live in Netlify rather than in this repository, because the repository is public.
*/

const MAX_NUMBERS = 3;
const TIMEOUT_MS = 8000;

export default async (req) => {
  let body;
  try { body = await req.json(); } catch (e) { return done("ignored: not JSON"); }
  const p = (body && body.payload) || body || {};
  const data = p.data || {};
  const form = String(p.form_name || data["form-name"] || "");
  try {
    if (form.startsWith("lead-")) return done(await leadAlert(form.slice(5), data, process.env));
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

async function leadAlert(id, d, env) {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) return "ignored: bad client id";
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
  const update = /measure time/i.test(String(d.update || ""));
  const head = update ? "Measure time picked" : d.wants === "Free measure" ? "New free measure request" : "New quote request";
  const lines = ["TraceQuote: " + head];
  lines.push([clean(d.name, 40) || "Homeowner", clean(d.phone, 20)].filter(Boolean).join(", "));
  const address = clean(d.address, 80);
  if (address && !/^not given/i.test(address)) lines.push(address);
  if (!update) {
    const fence = clean(String(d.fence || "").replace(/\s*\(length typed in by the homeowner, not traced\)/i, " (length typed in, not traced)"), 80);
    const extras = [];
    const gates = clean(d.gates, 30);
    if (gates && !/^none$/i.test(gates)) extras.push(gates);
    if (/^yes$/i.test(String(d.old_fence_removal || ""))) extras.push("old fence removal");
    if (fence) lines.push([fence].concat(extras).join(", "));
    const price = clean(d.price_shown, 30);
    if (price) lines.push("Saw " + price);
    const timing = clean(d.install_timing, 30);
    if (timing && !/^not given$/i.test(timing)) lines.push("Timing: " + timing);
  }
  const measure = clean(d.measure_visit, 40);
  if (measure) lines.push("Measure: " + measure);
  lines.push("Reply STOP to end alerts");
  return lines.join("\n");
}

// Homeowners type the name and address, so keep them short, on one line, and free of links: these texts go
// out under TraceQuote's registered number, and a link in one would look like ours.
function clean(s, max) {
  return String(s == null ? "" : s)
    .replace(/[\u0000-\u001f\u007f-\u009f]+/g, " ")
    .replace(/https?:\/\/\S*/gi, " ")
    .replace(/\bwww\.\S*/gi, " ")
    .replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|info|biz|io|co|us|me|ly|gl|gd|link|xyz|top|site|online|app|club|shop|live|click|ru|cn|tk)\b\S*/gi, " ")
    // Plain punctuation keeps a text in the cheaper GSM character set.
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/…/g, "...")
    .replace(/[  -​  　]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

// A US number as +1 and 10 digits, or "" if it isn't one.
function e164(s) {
  let d = String(s == null ? "" : s).replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? "+1" + d : "";
}

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
