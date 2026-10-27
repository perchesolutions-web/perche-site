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

  document.querySelectorAll("[data-book]").forEach(function (a) {
    if (CFG.bookingUrl) a.href = CFG.bookingUrl;
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-email]").forEach(function (el) {
    if (!CFG.contactEmail) return;
    el.textContent = CFG.contactEmail;
    if (el.tagName === "A") el.href = "mailto:" + CFG.contactEmail;
  });
})();
