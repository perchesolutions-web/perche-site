/*
  Client quote page (q/<client>/): runs the quote tool in client mode, so leads are sent to the client's
  Netlify form. With ?embed=1 the page is inside an iframe on the client's own website: it hides its own
  header and tells the parent page how tall it is (see /embed.js).

  ?via= says how the visitor got here, for analytics: inline (on a page of the client's site), popup (the
  pop-up from a button), frame (a builder's own embed box, like Wix's), link (a button that opens this page),
  or direct.
*/
(function () {
  "use strict";
  var C = window.TQ_CONFIG || {};
  var clientId = (C.lead && C.lead.clientId) || "";
  var q = window.location.search.slice(1);
  var embedded = /(?:^|&)embed=1(?:&|$)/.test(q);
  var via = (q.match(/(?:^|&)via=(inline|popup|frame|link)(?:&|$)/) || [])[1] || (embedded ? "inline" : "direct");
  if (embedded) document.documentElement.classList.add("cq-embed");
  if (embedded && via === "popup") document.documentElement.classList.add("cq-popup");

  try {
    if (window.posthog && typeof window.posthog.register === "function") {
      window.posthog.register({ client: clientId, client_embedded: embedded, client_via: via });
      window.posthog.capture("tq_client_page_opened", { client: clientId, embedded: embedded, via: via });
    }
  } catch (e) {}

  window.TraceQuote.mount(document.getElementById("quote"), { layout: "full", mode: "client" });

  if (!embedded || window.parent === window) return;
  // The embedding page titles its pop-up with the company name.
  window.parent.postMessage({ tq: "hello", client: clientId, name: (C.company && C.company.name) || "" }, "*");

  if (via === "popup") {
    // Escape closes the pop-up, unless it's closing the address suggestions.
    window.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute("role") === "combobox" && t.getAttribute("aria-expanded") === "true") return;
      window.parent.postMessage({ tq: "close", client: clientId }, "*");
    }, true);
    return;
  }

  // Tell the page that embeds us how tall the content is, so its iframe never needs a scrollbar.
  var page = document.querySelector(".cq") || document.body;
  var last = 0;
  function send() {
    var h = Math.ceil(page.getBoundingClientRect().height);
    if (!h || Math.abs(h - last) < 2) return;
    last = h;
    window.parent.postMessage({ tq: "height", client: clientId, h: h }, "*");
  }
  if (window.ResizeObserver) new ResizeObserver(send).observe(page);
  window.addEventListener("load", send);
  [0, 300, 1200, 3000].forEach(function (ms) { setTimeout(send, ms); });
})();
