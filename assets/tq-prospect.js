/*
  Personalized demo links for outreach.

  demo?c=Acme+Fence+Co.&n=Mike&w=acmefence.com&l=Coral+Gables,+FL

    c  company name (required; turns personalization on)
    n  owner's first name (optional, used in the greeting)
    w  company website (optional, shown as where the quote page would live)
    l  city and state (optional; address search favors results near there)

  Runs after tq-config.js and before the quote tool, so the tool shows the company's name.
  Everything from the link is cleaned and length-limited, and the page only ever inserts it as text.
  Links are made on links.html.
*/
(function () {
  "use strict";
  var CFG = window.TQ_CONFIG || (window.TQ_CONFIG = {});
  var q;
  try { q = new URLSearchParams(window.location.search); } catch (e) { return; }

  function clean(v, max) {
    return String(v || "").replace(/[\u0000-\u001f\u007f<>{}\\]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
  }

  var name = clean(q.get("c"), 60);
  if (!name) return;

  var first = clean(q.get("n"), 30).replace(/[^A-Za-zÀ-ɏ' -]/g, "").trim();
  var site = clean(q.get("w"), 100).toLowerCase()
    .replace(/^[a-z]+:\/\//, "").replace(/^www\./, "").split(/[\/?#:]/)[0];
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(site) || site.length > 63) site = "";
  var place = clean(q.get("l"), 60);
  var slug = name.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "prospect";

  CFG.demoCompany = Object.assign({}, CFG.demoCompany, {
    name: name,
    site: site ? site + "/instant-quote" : ((CFG.demoCompany && CFG.demoCompany.site) || "")
  });

  window.TQ_PROSPECT = { name: name, first: first, site: site, place: place, slug: slug };

  // Tag this visit so the site's analytics show which prospect opened their preview.
  try {
    if (window.posthog && typeof window.posthog.register === "function") {
      window.posthog.register({ prospect: slug, prospect_company: name });
      window.posthog.capture("tq_preview_opened", { prospect: slug, prospect_company: name, prospect_place: place || null });
    }
  } catch (e) {}

  // Point address search at the prospect's area.
  var token = typeof CFG.mapboxToken === "string" ? CFG.mapboxToken.trim() : "";
  if (!place || !/^pk\./.test(token) || !window.fetch) return;
  var key = "tqPlace:" + place.toLowerCase();
  try {
    var saved = JSON.parse(window.sessionStorage.getItem(key) || "null");
    if (saved && saved.length === 2) { CFG.mapCenter = saved; return; }
  } catch (e) {}
  var url = "https://api.mapbox.com/search/geocode/v6/forward?q=" + encodeURIComponent(place) +
    "&country=" + encodeURIComponent(CFG.searchCountry || "us") +
    "&types=place,locality,neighborhood,postcode&limit=1&access_token=" + encodeURIComponent(token);
  fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
    var f = data && data.features && data.features[0];
    var c = f && f.geometry && f.geometry.coordinates;
    if (!c || c.length !== 2) return;
    CFG.mapCenter = [c[0], c[1]];
    try { window.sessionStorage.setItem(key, JSON.stringify(CFG.mapCenter)); } catch (e) {}
  }).catch(function () {});
})();
