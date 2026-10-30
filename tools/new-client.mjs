#!/usr/bin/env node
/*
  Builds a client's quote page from clients/<id>.json:

    node tools/new-client.mjs clients/acme-fence.json

  Writes q/<id>/index.html (quote page + hidden Netlify form), q/<id>/client.js (settings),
  q/<id>/privacy.html, q/<id>/sms-terms.html, and q/<id>/install.html (the code for the client's website,
  with steps for each website builder). Commit those files; Netlify picks up the form on deploy.
  Leads then appear in Netlify under Forms -> lead-<id>; add an email notification there for the client.

  Send the client (or whoever runs their website) https://perchesolutions.com/q/<id>/install.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TPL = join(ROOT, "tools", "templates");

// Every field the quote tool sends (see leadFields in assets/tq-widget.js). Netlify only keeps fields
// that exist in the page's form, so this list and the tool must match.
export const LEAD_FIELDS = [
  "bot-field", "client", "lead_id", "update", "subject", "wants", "name", "phone", "email", "address", "fence", "gates",
  "old_fence_removal", "price_shown", "monthly_shown", "install_timing", "measure_visit", "text_consent",
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

  const vars = {
    ID: c.id,
    NAME: esc(co.name),
    ICON: co.logo ? esc(co.logo) : "/assets/favicon.svg",
    HOME_URL: web ? "https://" + esc(web) : "./",
    BRAND_HTML: co.logo ? '<img src="' + esc(co.logo) + '" alt="' + esc(co.name) + '">' : esc(co.name),
    CALL_HTML: d ? '<a class="cq-call" href="tel:+1' + d + '">Call ' + esc(co.phone) + "</a>" : "",
    SAMPLE_BANNER: c.sample ? '<p class="cq-sample">Sample client page for testing. Requests sent here go to TraceQuote, not to a fence company.</p>' : "",
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
  writeFileSync(join(out, "client.js"), lines.join("\n"));
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path) fail("usage: node tools/new-client.mjs clients/<id>.json");
  const c = load(resolve(path));
  const out = build(c);
  console.log("Built " + out.replace(ROOT + "/", "") + "/ (form lead-" + c.id + ")");
  // Settings from the /setup form list what still needs a person (blank prices, logo file, map center).
  const todo = (Array.isArray(c._review) ? c._review : []).filter((t) => !(c.mapCenter && /^Add mapCenter/.test(t)));
  if (!c.mapCenter && !todo.some((t) => /^Add mapCenter/.test(t))) todo.push("Add mapCenter [longitude, latitude] for the client's area.");
  if (todo.length) console.log("Still to do:\n" + todo.map((t) => "  - " + t).join("\n"));
  console.log("Quote page: https://perchesolutions.com/q/" + c.id + "/");
  console.log("Install page (code and steps for their website): https://perchesolutions.com/q/" + c.id + "/install");
}
