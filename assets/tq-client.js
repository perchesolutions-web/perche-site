/*
  Client quote page (q/<client>/): runs the quote tool in client mode, so leads are sent to the client's
  Netlify form. With ?embed=1 the page is inside an iframe on the client's own website: it hides its own
  header and tells the parent page how tall it is (see /embed.js).
*/
(function () {
  "use strict";
  var C = window.TQ_CONFIG || {};
  var clientId = (C.lead && C.lead.clientId) || "";
  var embedded = /(?:^|[?&])embed=1(?:&|$)/.test(window.location.search.slice(1));
  if (embedded) document.documentElement.classList.add("cq-embed");

  try {
    if (window.posthog && typeof window.posthog.register === "function") {
      window.posthog.register({ client: clientId, client_embedded: embedded });
      window.posthog.capture("tq_client_page_opened", { client: clientId, embedded: embedded });
    }
  } catch (e) {}

  window.TraceQuote.mount(document.getElementById("quote"), { layout: "full", mode: "client" });

  if (!embedded || window.parent === window) return;
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
