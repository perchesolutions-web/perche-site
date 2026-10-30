/*
  Personalized demo links for outreach.

  demo?c=Acme+Fence+Co.&n=Mike&w=acmefence.com&l=Coral+Gables,+FL

    c  company name (required; turns personalization on)
    n  owner's first name (optional, used in the greeting)
    w  company website (optional, shown as where the quote page would live)
    l  city and state (optional; address search favors results near there)

  Runs after tq-config.js and before the quote tool, so the tool shows the company's name.
  Everything from the link is cleaned and length-limited, and the page only ever inserts it as text.
  Links are made on links.html. When the prospect uses their demo, an alert is emailed (see watchActivity).
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

  watchActivity();

  // Alerts for the sales side. When the prospect actually uses their demo, the page posts the "demo-activity"
  // form (declared in netlify-forms.html), and Netlify emails it like any other form, so you can call while
  // they're looking. Three signals, each sent at most once per visit:
  //   opened  their first tap, click, key press or scroll wheel ("opened" at most once every 6 hours per
  //           browser). Link previews in texts and email link scanners load the page but never do that.
  //   tried   they saw prices for a fence, or opened the contractor view
  //   book    they clicked a Book button (if no Calendly booking email follows, they didn't finish)
  // Browsers where /links was used (it saves your name for the sign-off) never send alerts, so your own
  // tests stay quiet. Only what the link already says is sent: company, first name, website and area.
  function watchActivity() {
    var local = null, session = null;
    try { local = window.localStorage; } catch (e) {}
    try { session = window.sessionStorage; } catch (e) {}
    function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
    function set(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) {} }

    if (get(local, "tq-lb-sender") || get(local, "tq-no-alerts")) return;
    if (!window.fetch || !window.URLSearchParams || !document.addEventListener) return;

    var device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || "") ? "Phone or tablet" : "Computer";
    var SIGNALS = {
      opened: {
        subject: name + " opened their demo",
        next: "They have the demo open now. A call or text in the next few minutes is your best chance to reach them."
      },
      tried: {
        subject: name + " tried the quote tool on their demo",
        next: "They're trying it out. If you haven't reached them yet, now is a good time."
      },
      book: {
        subject: name + " clicked Book a call on their demo",
        next: "If Calendly doesn't email you a booking in the next few minutes, they didn't finish. Reach out and offer a time."
      }
    };

    function send(signal, what) {
      var key = "tq-alert:" + slug + ":" + signal;
      if (get(session, key)) return;
      set(session, key, "1");
      if (signal === "opened") {
        var last = parseInt(get(local, key) || "0", 10);
        if (last && Date.now() - last < 6 * 3600 * 1000) return;
        set(local, key, String(Date.now()));
      }
      var body = new URLSearchParams({
        "form-name": "demo-activity",
        subject: SIGNALS[signal].subject,
        company: name,
        owner: first,
        website: site,
        area: place,
        signal: what,
        device: device,
        link: window.location.href.split("#")[0],
        next_step: SIGNALS[signal].next,
        "bot-field": ""
      }).toString();
      try {
        // keepalive lets the "book" alert finish even though the click leaves the page.
        fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body, keepalive: true })
          .catch(function () {});
      } catch (e) {}
    }

    var EVENTS = ["pointerdown", "touchstart", "keydown", "wheel"];
    var opened = false;
    function onFirstUse() {
      if (opened) return;
      opened = true;
      EVENTS.forEach(function (t) { document.removeEventListener(t, onFirstUse, true); });
      send("opened", "Opened the demo and started using it");
    }
    EVENTS.forEach(function (t) { document.addEventListener(t, onFirstUse, { capture: true, passive: true }); });

    // Prices on screen: the quote step of the demo's quote tool.
    function watchPrices() {
      var root = document.getElementById("demo-quote");
      if (!root || !window.MutationObserver) return;
      var mo = new MutationObserver(function () {
        if (!opened || !root.querySelector(".tq-prods")) return;
        mo.disconnect();
        send("tried", "Saw prices in the quote tool");
      });
      mo.observe(root, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchPrices);
    else watchPrices();

    window.addEventListener("hashchange", function () {
      if (opened && window.location.hash === "#contractor") send("tried", "Opened the contractor view (the request email a company gets)");
    });

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[data-book], a[href*='calendly.com']") : null;
      if (!a) return;
      onFirstUse();
      send("book", "Clicked a Book button" + (a.getAttribute("data-book") ? " (" + a.getAttribute("data-book") + ")" : ""));
    }, true);
  }

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
