/*
  TraceQuote embed: one script, three ways to show a fence company's quote tool on their own website.
  Each client's install page has the code ready to copy, with steps for each website builder:
  https://perchesolutions.com/q/CLIENT-ID/install

  1. On a page. The quote tool itself, as tall as it needs to be:

       <div id="tracequote"></div>
       <script src="https://perchesolutions.com/embed.js" data-client="CLIENT-ID" async></script>

     data-target="some-id" puts it in another element. Without a #tracequote element on the page, it goes
     where the script is.

  2. A button that opens the quote tool in a pop-up, placed where the script is:

       <script src="https://perchesolutions.com/embed.js" data-client="CLIENT-ID" data-mode="button" async></script>

  3. A floating button in the corner of every page. Paste it once into the site-wide footer code:

       <script src="https://perchesolutions.com/embed.js" data-client="CLIENT-ID" data-mode="floating" async></script>

  With any of these on a page, links to #instant-quote open the pop-up too, so the site's own buttons can
  open it. Buttons take data-label="Get a free quote" and data-color="#1a5d3a"; the floating one also takes
  data-position="left".

  Some builders run pasted code inside a frame of their own (Wix's Embed HTML, GoDaddy's HTML section,
  Google Sites). A pop-up there could only fill that small frame, so buttons open the quote page in a new tab.
*/
(function () {
  "use strict";
  var w = window, d = document;
  var DEFAULT_COLOR = "#0f5a43";
  var state = w.__tqEmbed || (w.__tqEmbed = { frames: [], popups: {}, first: null, listening: false });

  var framed = true;
  try { framed = w.self !== w.top; } catch (e) {}

  function warn(msg) {
    try { if (w.console && console.warn) console.warn("TraceQuote embed: " + msg); } catch (e) {}
  }

  // Inline styles that a website theme's CSS can't override.
  function force(el, styles) {
    Object.keys(styles).forEach(function (k) { el.style.setProperty(k, styles[k], "important"); });
  }

  function whenReady(fn) {
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function pageUrl(o, via, embedded) {
    return o.origin + "/q/" + o.client + "/?" + (embedded ? "embed=1&" : "") + "via=" + via;
  }

  // Readable text on the button color.
  function textOn(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var lin = function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.4 ? "#111a15" : "#ffffff";
  }

  function options(script) {
    var client = (script.getAttribute("data-client") || "").trim().toLowerCase();
    if (!/^[a-z0-9-]{1,40}$/.test(client)) { warn("data-client is missing or isn't a client ID"); return null; }
    var origin;
    try { origin = new URL(script.src, w.location.href).origin; } catch (e) { return null; }
    var mode = (script.getAttribute("data-mode") || "inline").trim().toLowerCase();
    if (mode !== "button" && mode !== "floating") mode = "inline";
    var color = (script.getAttribute("data-color") || "").trim();
    if (/^#[0-9a-f]{3}$/i.test(color)) color = "#" + color.slice(1).split("").map(function (c) { return c + c; }).join("");
    if (!/^#[0-9a-f]{6}$/i.test(color)) color = DEFAULT_COLOR;
    var label = (script.getAttribute("data-label") || "").replace(/\s+/g, " ").trim().slice(0, 40);
    return {
      script: script, client: client, origin: origin, mode: mode, color: color,
      label: label || (mode === "floating" ? "Instant quote" : "Get an instant quote"),
      left: (script.getAttribute("data-position") || "").trim().toLowerCase() === "left",
      target: (script.getAttribute("data-target") || "").trim()
    };
  }

  /* ---------- 1. on a page ---------- */

  function placeInline(o) {
    var id = o.target || "tracequote";
    var target = d.getElementById(id);
    if (target && target.hasAttribute("data-tq-mounted")) target = null;
    if (!target) {
      if (d.readyState === "loading") { d.addEventListener("DOMContentLoaded", function () { placeInline(o); }); return; }
      if (!d.body || !d.body.contains(o.script)) {
        warn('add <div id="' + id + '"></div> where the quote tool should go, or put this script in the page body');
        return;
      }
      target = d.createElement("div");
      o.script.parentNode.insertBefore(target, o.script);
    }
    target.setAttribute("data-tq-mounted", "");
    var frame = d.createElement("iframe");
    frame.src = pageUrl(o, framed ? "frame" : "inline", true);
    frame.title = "Instant fence quote";
    frame.setAttribute("loading", "eager");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    force(frame, {
      display: "block", width: "100%", "max-width": "100%", "min-width": "0", height: "1100px", "min-height": "0",
      "max-height": "none", border: "0", margin: "0", padding: "0", background: "transparent", "color-scheme": "light"
    });
    target.appendChild(frame);
    state.frames.push({ el: frame, origin: o.origin, kind: "inline" });
  }

  /* ---------- 2 and 3. buttons and the pop-up ---------- */

  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  var FENCE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 21V7l2-3 2 3v14M10 21V7l2-3 2 3v14M16 21V7l2-3 2 3v14M3 10.5h18M3 16.5h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  function buttonCss(o, floating) {
    var fg = textOn(o.color);
    return ":host{all:initial;display:" + (floating ? "block" : "inline-block") + "}" +
      ".b{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:10px;margin:0;" +
      "min-height:48px;padding:12px 22px;border:0;border-radius:999px;cursor:pointer;text-decoration:none;" +
      "font-family:" + FONT + ";font-size:16px;font-weight:700;line-height:1.2;letter-spacing:normal;text-transform:none;" +
      "background:" + o.color + ";color:" + fg + ";box-shadow:0 1px 2px rgba(0,0,0,.18)" + (floating ? ",0 10px 28px rgba(0,0,0,.24)" : "") + ";" +
      "transition:filter .15s,transform .15s;-webkit-tap-highlight-color:transparent}" +
      ".b:hover{filter:brightness(1.08)}.b:active{transform:translateY(1px)}" +
      ".b:focus-visible{outline:3px solid " + o.color + ";outline-offset:3px}" +
      ".b svg{flex:none}" +
      (floating ? "@media (max-width:480px){.b{padding:12px 18px;font-size:15px}}" : "") +
      "@media (prefers-reduced-motion:reduce){.b{transition:none}}";
  }

  // A button (or, inside a builder's frame, a link that opens the quote page in a new tab).
  function makeButton(o, floating) {
    var host = d.createElement(floating ? "div" : "span");
    host.setAttribute("data-tracequote", o.client);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : null;
    var el;
    if (framed) {
      el = d.createElement("a");
      el.href = pageUrl(o, "link", false);
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el = d.createElement("button");
      el.type = "button";
      el.setAttribute("aria-haspopup", "dialog");
      el.addEventListener("click", function (e) { popupFor(o).open(el, e.detail === 0); });
      var warm = function () { popupFor(o).load(); };
      el.addEventListener("pointerenter", warm, { once: true });
      el.addEventListener("focus", warm, { once: true });
      el.addEventListener("touchstart", warm, { once: true, passive: true });
    }
    el.className = "b";
    el.innerHTML = FENCE_ICON + "<span></span>";
    el.lastChild.textContent = o.label;
    if (root) {
      var style = d.createElement("style");
      style.textContent = buttonCss(o, floating);
      root.appendChild(style);
      root.appendChild(el);
    } else {
      force(el, { background: o.color, color: textOn(o.color), padding: "12px 22px", "border-radius": "999px", "font-weight": "700", "text-decoration": "none" });
      host.appendChild(el);
    }
    return host;
  }

  function placeButton(o) {
    var target = o.target ? d.getElementById(o.target) : null;
    if (target) { target.appendChild(makeButton(o, false)); return; }
    if (!d.body || !d.body.contains(o.script)) { warn("put the button script in the page body where the button should go"); return; }
    o.script.parentNode.insertBefore(makeButton(o, false), o.script);
  }

  function placeFloating(o) {
    if (!d.body) return;
    if (framed) { placeButton(o); return; }
    if (d.querySelector('[data-tracequote-floating="' + o.client + '"]')) return;
    var host = makeButton(o, true);
    host.setAttribute("data-tracequote-floating", o.client);
    force(host, {
      position: "fixed", bottom: "18px", "z-index": "2147483000",
      right: o.left ? "auto" : "18px", left: o.left ? "18px" : "auto", top: "auto", margin: "0"
    });
    // Clear of the iPhone home bar where supported (browsers without max() keep 18px).
    host.style.setProperty("bottom", "max(18px, calc(env(safe-area-inset-bottom) + 8px))", "important");
    d.body.appendChild(host);
  }

  var POPUP_CSS =
    ":host{all:initial}" +
    ".backdrop{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(14,20,17,.62)}" +
    ".dialog{position:fixed;top:24px;right:24px;bottom:24px;left:24px;margin:auto;max-width:1120px;max-height:940px;" +
    "display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.35);" +
    "font-family:" + FONT + ";color:#16201b}" +
    ".bar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex:none;padding:8px 8px 8px 18px;" +
    "border-bottom:1px solid #e2e7e4;background:#fff}" +
    ".title{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:700;line-height:1.3}" +
    ".close{box-sizing:border-box;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;" +
    "min-width:44px;height:44px;padding:0 12px;margin:0;border:0;border-radius:10px;background:transparent;cursor:pointer;" +
    "font-family:inherit;font-size:15px;font-weight:600;color:#16201b}" +
    ".close:hover{background:#eef2ef}.close:focus-visible{outline:3px solid #0f5a43;outline-offset:1px}" +
    ".body{position:relative;flex:1;min-height:0;background:#fff}" +
    "iframe{display:block;width:100%;height:100%;border:0;background:#fff;color-scheme:light}" +
    ".wait{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;" +
    "font-size:15px;color:#5a665f}" +
    "@media (max-width:640px),(max-height:520px){.dialog{top:0;right:0;bottom:0;left:0;max-width:none;max-height:none;border-radius:0}" +
    ".bar{padding-top:max(8px,env(safe-area-inset-top))}}";

  function popupFor(o) {
    if (state.popups[o.client]) return state.popups[o.client];
    var host = d.createElement("div");
    host.setAttribute("data-tracequote-popup", o.client);
    force(host, { position: "fixed", top: "0", right: "0", bottom: "0", left: "0", "z-index": "2147483646", display: "none", margin: "0" });
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML = "<style>" + POPUP_CSS + "</style>" +
      '<div class="backdrop"></div>' +
      '<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="t">' +
      '<div class="bar"><span class="title" id="t">Instant fence quote</span>' +
      '<button class="close" type="button" aria-label="Close the quote tool">Close <span aria-hidden="true">✕</span></button></div>' +
      '<div class="body"><div class="wait">Loading your quote tool…</div></div></div>';
    var body = root.querySelector(".body"), title = root.querySelector(".title"), closeBtn = root.querySelector(".close");
    var frame = null, opener = null, saved = null, isOpen = false;

    function load() {
      if (frame) return;
      if (!host.parentNode) d.body.appendChild(host);
      frame = d.createElement("iframe");
      frame.src = pageUrl(o, "popup", true);
      frame.title = "Instant fence quote";
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      frame.addEventListener("load", function () { var wEl = root.querySelector(".wait"); if (wEl) wEl.remove(); });
      body.appendChild(frame);
      state.frames.push({ el: frame, origin: o.origin, kind: "popup", popup: api });
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab" && root.activeElement === closeBtn && e.shiftKey) { e.preventDefault(); frame && frame.focus(); }
    }
    // keyboard: opened with Enter or Space, so the focus ring on Close should show.
    function open(from, keyboard) {
      load();
      opener = from || d.activeElement;
      if (isOpen) return;
      isOpen = true;
      saved = [d.documentElement.style.getPropertyValue("overflow"), d.body.style.getPropertyValue("overflow")];
      d.documentElement.style.setProperty("overflow", "hidden");
      d.body.style.setProperty("overflow", "hidden");
      force(host, { display: "block" });
      d.addEventListener("keydown", onKey, true);
      try { closeBtn.focus({ preventScroll: true, focusVisible: !!keyboard }); } catch (e) { closeBtn.focus(); }
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      force(host, { display: "none" });
      d.documentElement.style.setProperty("overflow", saved[0]);
      d.body.style.setProperty("overflow", saved[1]);
      d.removeEventListener("keydown", onKey, true);
      if (opener && opener.focus) try { opener.focus({ preventScroll: true }); } catch (e) {}
    }
    function setTitle(name) {
      name = String(name || "").replace(/\s+/g, " ").trim().slice(0, 80);
      if (name) title.textContent = name + " · Instant quote";
    }
    closeBtn.addEventListener("click", close);
    root.querySelector(".backdrop").addEventListener("click", close);
    var api = { open: open, close: close, load: load, setTitle: setTitle, isOpen: function () { return isOpen; } };
    state.popups[o.client] = api;
    return api;
  }

  // Opens the quote tool from anything: a pop-up on the page, or a new tab inside a builder's frame.
  function openFor(o, from, keyboard) {
    if (framed || !d.body || !d.body.attachShadow) {
      var win = w.open(pageUrl(o, "link", false), "_blank", "noopener");
      if (!win) w.location.href = pageUrl(o, "link", false);
      return;
    }
    popupFor(o).open(from, keyboard);
  }

  /* ---------- messages from the quote page ---------- */

  function listen() {
    if (state.listening) return;
    state.listening = true;
    w.addEventListener("message", function (e) {
      var m = e.data;
      if (!m || typeof m !== "object" || typeof m.tq !== "string") return;
      var f = null;
      for (var i = 0; i < state.frames.length; i++) if (state.frames[i].el.contentWindow === e.source) f = state.frames[i];
      if (!f || e.origin !== f.origin) return;
      if (m.tq === "height" && f.kind === "inline" && typeof m.h === "number" && isFinite(m.h)) {
        f.el.style.setProperty("height", Math.max(420, Math.min(6000, Math.round(m.h))) + "px", "important");
      } else if (m.tq === "hello" && f.kind === "popup") {
        f.popup.setTitle(m.name);
      } else if (m.tq === "close" && f.kind === "popup") {
        f.popup.close();
      }
    });
    // The site's own buttons and links: anything pointing at #instant-quote opens the quote tool.
    d.addEventListener("click", function (e) {
      if (!state.first || e.defaultPrevented || e.button > 0) return;
      var t = e.target && e.target.closest ? e.target.closest('a[href$="#instant-quote"], [data-tracequote-open]') : null;
      if (!t) return;
      e.preventDefault();
      openFor(state.first, t, e.detail === 0);
    });
    w.TraceQuoteEmbed = { open: function () { if (state.first) openFor(state.first); } };
  }

  /* ---------- start ---------- */

  function run(script) {
    script.setAttribute("data-tq-done", "");
    var o = options(script);
    if (!o) return;
    if (!state.first) state.first = o;
    listen();
    if (o.mode === "button") whenReady(function () { placeButton(o); });
    else if (o.mode === "floating") whenReady(function () { placeFloating(o); });
    else placeInline(o);
  }

  // This script, plus any copies on the page that haven't run (some builders insert scripts in ways that
  // leave document.currentScript empty).
  var mine = d.currentScript;
  var origin = "";
  try { origin = mine && mine.src ? new URL(mine.src, w.location.href).origin : ""; } catch (e) {}
  var all = d.querySelectorAll("script[data-client]");
  for (var i = 0; i < all.length; i++) {
    var s = all[i], u = null;
    if (s.hasAttribute("data-tq-done")) continue;
    try { u = new URL(s.src, w.location.href); } catch (e) { continue; }
    if (u.pathname !== "/embed.js") continue;
    // Only copies of this same script (or, if the browser didn't say which script is running, ours).
    if (origin ? u.origin !== origin : !/(^|\.)perchesolutions\.com$|--perchesolutions\.netlify\.app$/.test(u.hostname)) continue;
    run(s);
  }
})();
