/* Shared page behavior: theme toggle, mobile menu, booking links. */
(function () {
  "use strict";
  var CFG = window.TQ_CONFIG || {};
  var root = document.documentElement;

  document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      var dark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("tq-theme", next); } catch (e) { /* storage unavailable */ }
    });
  });

  var menuBtn = document.querySelector("[data-menu]");
  var links = document.querySelector(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Booking links carry where they were clicked, so Calendly's meeting list and export show which page (and, from a
  // demo link, which fence company) a call came from. data-book="hero" names the button; no personal details go in.
  var P = window.TQ_PROSPECT || null;
  var page = window.location.pathname.replace(/^\/+|\/+$|\.html$/g, "") || "home";
  function bookingUrl(place) {
    if (!CFG.bookingUrl) return "";
    try {
      var u = new URL(CFG.bookingUrl);
      u.searchParams.set("utm_source", P ? "demo-link" : "website");
      u.searchParams.set("utm_medium", page);
      if (P && P.slug) u.searchParams.set("utm_campaign", P.slug);
      if (place) u.searchParams.set("utm_content", place);
      return u.toString();
    } catch (e) {
      return CFG.bookingUrl;
    }
  }
  document.querySelectorAll("[data-book]").forEach(function (a) {
    var place = a.getAttribute("data-book") || "";
    var href = bookingUrl(place);
    if (href) a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    a.addEventListener("click", function () {
      try {
        if (window.posthog && typeof window.posthog.capture === "function") {
          window.posthog.capture("tq_book_clicked", { placement: place || null, page: page, prospect: P ? P.slug : null });
        }
      } catch (e) { /* analytics is optional */ }
    });
  });
  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (!CFG.contactEmail) return;
    el.textContent = CFG.contactEmail;
    if (el.tagName === "A") el.href = "mailto:" + CFG.contactEmail;
  });
})();
