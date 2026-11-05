#!/usr/bin/env node
/*
  Builds a client's quote page from clients/<id>.json:

    node tools/new-client.mjs clients/acme-fence.json

  Writes q/<id>/index.html (quote page + hidden Netlify form), q/<id>/client.js (settings),
  q/<id>/privacy.html, q/<id>/sms-terms.html, q/<id>/install.html (the code for the client's website,
  with steps for each website builder), and q/<id>/card.html (a printable QR card and a text-back line). It also rewrites clients/directory.mjs, the contact details the
  request emails use for every client. Commit those files; Netlify picks up the form on deploy.
  Leads then appear in Netlify under Forms -> lead-<id>. Once request emails are set up (RESEND_API_KEY in
  Netlify), they go to the client's leadEmails automatically; until then, add a Netlify email notification.

  Send the client (or whoever runs their website) https://perchesolutions.com/q/<id>/install.
*/
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { qrcode } from "./vendor/qrcode.mjs"; // qrcode-generator, MIT (see tools/vendor/LICENSE-qrcode-generator.txt)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TPL = join(ROOT, "tools", "templates");
// Printed QR codes can't be edited later, so the address in them is the one that has to keep working.
const SITE = "https://perchesolutions.com";

// The QR code as an inline SVG: black on white with a 4-module quiet zone, drawn as one path so it stays crisp at any size.
// Error correction Q (about 25% of the code can be damaged), because these end up on trucks and windows.
export function qrSvg(url, label) {
  const qr = qrcode(0, "Q");
  qr.addData(url);
  qr.make();
  const n = qr.getModuleCount(), pad = 4, d = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c)) continue;
      let len = 1;
      while (c + len < n && qr.isDark(r, c + len)) len++;
      d.push("M" + (c + pad) + " " + (r + pad) + "h" + len + "v1h-" + len + "z");
      c += len - 1;
    }
  }
  const size = n + pad * 2;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + " " + size + '" role="img" aria-label="' + esc(label) + '" shape-rendering="crispEdges">' +
    '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path fill="#000" d="' + d.join("") + '"/></svg>';
}

// Every field the quote tool sends (see leadFields in assets/tq-widget.js). Netlify only keeps fields
// that exist in the page's form, so this list and the tool must match.
export const LEAD_FIELDS = [
  "bot-field", "client", "lead_id", "update", "subject", "wants", "name", "phone", "email", "address", "fence", "gates",
  "old_fence_removal", "price_shown", "price_estimate", "monthly_shown", "install_timing", "measure_visit", "text_consent",
  "consent_text", "map_image", "directions", "drawing", "page", "embedded_on", "submitted_at"
];
const LONG_FIELDS = new Set(["consent_text", "drawing", "map_image"]);

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function fail(msg) { console.error("new-client: " + msg); process.exit(1); }

function load(path) {
  let c;
  try { c = JSON.parse(readFileSync(path, "utf8")); } catch (e) { fail("can't read " + path + ": " + e.message); }
  if (!/^[a-z0-9-]{1,40}$/.test(c.id || "")) fail('"id" must be lowercase letters, numbers and dashes');
  if (!c.company || !c.company.name) fail('"company.name" is required');
  if (c.mapCenter && !(Array.isArray(c.mapCenter) && c.mapCenter.length === 2 && c.mapCenter.every(Number.isFinite))) fail('"mapCenter" must be [longitude, latitude]');
  if (c.company.logo && !/^[a-z0-9._-]+\.(png|jpe?g|svg|webp)$/i.test(c.company.logo)) fail('"company.logo" must be a file name in q/<id>/, like logo.png');
  if (c.priceDisplay != null && !["range", "from", "none"].includes(c.priceDisplay)) fail('"priceDisplay" must be "range", "from" or "none"');
  return c;
}

function digits(phone) {
  let d = String(phone || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  return d.length === 10 ? d : "";
}

function site(url) {
  const s = String(url || "").trim().toLowerCase().replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[\/?#]/)[0];
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s) ? s : "";
}

// The website builder the client named on the setup form, as the install page's section name.
const PLATFORMS = {
  wordpress: "wordpress", wix: "wix", squarespace: "squarespace", godaddy: "godaddy", shopify: "shopify",
  webflow: "webflow", "square online": "square", square: "square", "google sites": "google-sites", other: "other"
};
function platform(c) {
  const p = String((c.website && c.website.platform) || "").trim().toLowerCase();
  return PLATFORMS[p] || "";
}

function fill(tpl, vars) {
  return tpl.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in vars)) fail("template needs {{" + k + "}}");
    return vars[k];
  });
}

function build(c) {
  const co = c.company;
  const d = digits(co.phone);
  const web = site(co.website);
  const today = new Date();
  const contact = [
    co.phone ? "Phone: " + esc(co.phone) : "",
    co.email ? 'Email: <a href="mailto:' + esc(co.email) + '">' + esc(co.email) + "</a>" : "",
    web ? 'Website: <a href="https://' + esc(web) + '">' + esc(web) + "</a>" : ""
  ].filter(Boolean).map((l) => "<br>" + l).join("");

  // The page's headline matches how the company shows prices (see priceDisplay in the quote tool).
  const noPrice = c.priceDisplay === "none";
  const nameEnd = esc(co.name).replace(/\.$/, ""); // "Acme Fence Co." ends a sentence without a second period
  const words = noPrice
    ? {
        HEADLINE: "Measure your fence in about a minute",
        LEDE: "Search your address, tap where the fence goes on the satellite photo, and pick a style. Then send it to " + esc(co.name) + " for your price.",
        DESCRIPTION: "Measure your new fence in about a minute. Search your address, trace the fence on satellite imagery, pick a style, and get your price from " + nameEnd + "."
      }
    : {
        HEADLINE: "Get your fence price in about a minute",
        LEDE: "Search your address, tap where the fence goes on the satellite photo, and compare styles and prices. No sign-up needed to see your price.",
        DESCRIPTION: "See the price of a new fence in about a minute. Search your address, trace the fence on satellite imagery, and compare styles from " + nameEnd + "."
      };

  const vars = {
    ...words,
    ID: c.id,
    NAME: esc(co.name),
    ICON: co.logo ? esc(co.logo) : "/assets/favicon.svg",
    HOME_URL: web ? "https://" + esc(web) : "./",
    BRAND_HTML: co.logo ? '<img src="' + esc(co.logo) + '" alt="' + esc(co.name) + '">' : esc(co.name),
    CALL_HTML: d ? '<a class="cq-call" href="tel:+1' + d + '">Call ' + esc(co.phone) + "</a>" : "",
    // The printable QR card (card.html): the code opens the quote page tagged ?via=qr, the text-back line is tagged ?via=text.
    QR_SVG: qrSvg(SITE + "/q/" + c.id + "/?via=qr", "QR code that opens the " + co.name + " fence quote page"),
    SHORT_URL: SITE.replace(/^https:\/\//, "") + "/q/" + c.id,
    CARD_HEAD: noPrice ? "Scan to measure your fence" : "Scan to see your fence price",
    CARD_MINOR: noPrice
      ? "Trace your fence on a satellite photo and pick a style. Then send it to " + esc(co.name) + " for your price."
      : "Trace your fence on a satellite photo and pick a style. Takes about a minute.",
    CARD_PHONE: d ? '<p class="qc-phone">Call ' + esc(co.phone) + "</p>" : "",
    TEXT_LINE: esc(
      "Hi, this is " + co.name.replace(/\.$/, "") + ". Thanks for reaching out about a fence. " +
      (noPrice
        ? "Trace it on a satellite photo of your yard here, and we'll get back to you with your price: "
        : "Trace it on a satellite photo of your yard here and see prices for different styles in about a minute: ") +
      SITE + "/q/" + c.id + "/?via=text"
    ),
    SAMPLE_BANNER: c.sample ? '<aside class="cq-sample" aria-label="Sample page notice">Sample client page for testing. Requests sent here go to TraceQuote, not to a fence company.</aside>' : "",
    YEAR: String(today.getFullYear()),
    UPDATED: today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    CONTACT_LINES: contact,
    PLATFORM: platform(c),
    POSTHOG: readFileSync(join(TPL, "posthog.html.tpl"), "utf8").trim(),
    FORM_FIELDS: LEAD_FIELDS.map((f) => LONG_FIELDS.has(f) ? '  <textarea name="' + f + '"></textarea>' : '  <input type="hidden" name="' + f + '">').join("\n")
  };

  const settings = {
    company: { name: co.name, phone: co.phone || "", site: web ? web : "" },
    lead: { clientId: c.id, formName: "lead-" + c.id, endpoint: "/", privacyUrl: "privacy.html", smsTermsUrl: "sms-terms.html" }
  };
  const lines = [
    "/* Generated by tools/new-client.mjs from clients/" + c.id + ".json. Edit the JSON and regenerate instead of editing this file. */",
    "(function () {",
    '  "use strict";',
    "  var C = window.TQ_CONFIG = window.TQ_CONFIG || {};",
    "  C.company = " + JSON.stringify(settings.company) + ";",
    "  C.lead = " + JSON.stringify(settings.lead) + ";"
  ];
  if (c.mapCenter) lines.push("  C.mapCenter = " + JSON.stringify(c.mapCenter) + ";");
  if (c.priceDisplay && c.priceDisplay !== "range") lines.push("  C.priceDisplay = " + JSON.stringify(c.priceDisplay) + ";");
  if (c.financing) lines.push("  C.financing = Object.assign({}, C.financing, " + JSON.stringify(c.financing) + ");");
  if (c.timingOptions) lines.push("  C.timingOptions = " + JSON.stringify(c.timingOptions) + ";");
  if (c.pricing) lines.push("  C.pricing = " + JSON.stringify(c.pricing) + ";");
  lines.push("})();", "");

  const out = join(ROOT, "q", c.id);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "index.html"), fill(readFileSync(join(TPL, "client-index.html.tpl"), "utf8"), vars));
  writeFileSync(join(out, "privacy.html"), fill(readFileSync(join(TPL, "client-privacy.html.tpl"), "utf8"), vars));
  writeFileSync(join(out, "sms-terms.html"), fill(readFileSync(join(TPL, "client-sms-terms.html.tpl"), "utf8"), vars));
  writeFileSync(join(out, "install.html"), fill(readFileSync(join(TPL, "client-install.html.tpl"), "utf8"), vars));
  writeFileSync(join(out, "card.html"), fill(readFileSync(join(TPL, "client-card.html.tpl"), "utf8"), vars));
  writeFileSync(join(out, "client.js"), lines.join("\n"));
  return out;
}

const isEmail = (e) => typeof e === "string" && e.length <= 254 && /^[^\s@<>",;:()\[\]\\]+@[^\s@<>",;:()\[\]\\]+\.[a-z]{2,}$/i.test(e.trim());

// clients/directory.mjs: each client's name, phone and request emails, for netlify/functions/submission-created.mjs.
// Rebuilt from every clients/*.json, so it never goes stale. Text alert numbers are not here (see SETUP.md).
export function writeDirectory() {
  const dir = join(ROOT, "clients"), all = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const c = load(join(dir, f)), co = c.company;
    all[c.id] = {
      name: co.name, phone: co.phone || "", email: isEmail(co.email) ? co.email.trim() : "", website: site(co.website),
      leadEmails: (Array.isArray(c.leadEmails) ? c.leadEmails : []).filter(isEmail).map((e) => e.trim()),
      priceDisplay: c.priceDisplay || "range", sample: !!c.sample
    };
  }
  writeFileSync(join(dir, "directory.mjs"),
    "// Generated by tools/new-client.mjs from clients/*.json: contact details for request emails. Don't edit by hand.\n" +
    "export default " + JSON.stringify(all, null, 2) + ";\n");
  return Object.keys(all);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path) fail("usage: node tools/new-client.mjs clients/<id>.json");
  const c = load(resolve(path));
  const out = build(c);
  console.log("Built " + out.replace(ROOT + "/", "") + "/ (form lead-" + c.id + ")");
  console.log("Updated clients/directory.mjs (" + writeDirectory().length + " clients). Commit it with the page.");
  // Settings from the /setup form list what still needs a person (blank prices, logo file, map center).
  const todo = (Array.isArray(c._review) ? c._review : []).filter((t) => !(c.mapCenter && /^Add mapCenter/.test(t)));
  if (!c.mapCenter && !todo.some((t) => /^Add mapCenter/.test(t))) todo.push("Add mapCenter [longitude, latitude] for the client's area.");
  if (todo.length) console.log("Still to do:\n" + todo.map((t) => "  - " + t).join("\n"));
  console.log("Quote page: https://perchesolutions.com/q/" + c.id + "/");
  console.log("Install page (code and steps for their website): https://perchesolutions.com/q/" + c.id + "/install");
  console.log("QR card (print it, plus a text-back line): https://perchesolutions.com/q/" + c.id + "/card");
  // Alert numbers go in Netlify, not in clients/<id>.json, because this repository is public.
  if (!todo.some((t) => /^Text alerts/.test(t))) console.log("Text alerts, if they want them: Netlify variable TQ_TEXT_" + c.id.toUpperCase().replace(/-/g, "_") + " (their mobile numbers, comma-separated), then deploy.");
}
