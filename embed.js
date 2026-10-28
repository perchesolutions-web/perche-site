/*
  TraceQuote embed. Put this where the quote tool should appear on the fence company's website:

    <div id="tracequote"></div>
    <script src="https://perchesolutions.com/embed.js" data-client="CLIENT-ID" async></script>

  It adds an iframe with the company's quote page and keeps the iframe as tall as its content.
  Optional: data-target="some-element-id" to place it somewhere other than #tracequote.
*/
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var client = (script.getAttribute("data-client") || "").toLowerCase();
  if (!/^[a-z0-9-]{1,40}$/.test(client)) return;
  var origin;
  try { origin = new URL(script.src, window.location.href).origin; } catch (e) { return; }

  var target = document.getElementById(script.getAttribute("data-target") || "tracequote");
  if (!target) {
    target = document.createElement("div");
    script.parentNode.insertBefore(target, script);
  }

  var frame = document.createElement("iframe");
  frame.src = origin + "/q/" + client + "/?embed=1";
  frame.title = "Instant fence quote";
  frame.setAttribute("loading", "eager");
  frame.style.cssText = "display:block;width:100%;height:1100px;border:0;background:transparent;overflow:hidden;color-scheme:light";
  target.appendChild(frame);

  window.addEventListener("message", function (e) {
    if (e.origin !== origin || e.source !== frame.contentWindow) return;
    var d = e.data;
    if (!d || d.tq !== "height" || typeof d.h !== "number") return;
    frame.style.height = Math.max(420, Math.min(5000, Math.round(d.h))) + "px";
  });
})();
