/*
  TraceQuote homeowner widget.
  With a Mapbox token: address search -> live satellite map -> draw -> style -> details -> price.
  Without one, or if the map can't load: the same flow on an illustrated example home.
*/
(function () {
  "use strict";

  var CFG = window.TQ_CONFIG || {};
  var P = CFG.pricing;
  var COMPANY = (CFG.demoCompany && CFG.demoCompany.name) || "Your Fence Co.";
  var MAPBOX_VERSION = "3.28.1";
  var MAP_STYLE = CFG.mapStyle || "mapbox://styles/mapbox/satellite-streets-v12";
  var TOKEN = typeof CFG.mapboxToken === "string" ? CFG.mapboxToken.trim() : "";
  var LIVE = /^pk\./.test(TOKEN);
  var HOME_ZOOM = CFG.mapHomeZoom || 19.5;
  var MIN_DRAW_ZOOM = CFG.minDrawZoom || 17;
  var SVGNS = "http://www.w3.org/2000/svg";
  var uid = 0;

  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Math.round(n).toLocaleString("en-US"); }
  function moneyRange(lo, hi) { return lo === hi ? money(lo) : money(lo) + "–" + money(hi); }
  function ftLabel(n) { return Math.round(n).toLocaleString("en-US") + " ft"; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function f1(n) { return n.toFixed(1); }

  function materialById(id) {
    for (var i = 0; i < P.materials.length; i++) if (P.materials[i].id === id) return P.materials[i];
    return P.materials[0];
  }
  function heightOrDefault(mat, h) { return mat.heights[h] ? h : mat.defaultHeight; }
  function styleLabel(materialId, height) {
    var m = materialById(materialId);
    return heightOrDefault(m, height) + " ft " + m.name.toLowerCase();
  }
  function gateSummary(gates) {
    var w = 0, d = 0;
    gates.forEach(function (g) { if (g.type === "drive") d++; else w++; });
    var parts = [];
    if (w) parts.push(plural(w, "walk gate", "walk gates"));
    if (d) parts.push(plural(d, "drive gate", "drive gates"));
    return parts.join(", ");
  }

  /* ---------- pricing ---------- */

  function priceFor(drawnFt, gates, sel) {
    var mat = materialById(sel.material);
    var h = heightOrDefault(mat, sel.height);
    var per = mat.heights[h];
    var gateFt = 0, gLo = 0, gHi = 0;
    gates.forEach(function (g) {
      var G = P.gates[g.type];
      gateFt += G.width; gLo += G.price[0]; gHi += G.price[1];
    });
    var fenceFt = Math.max(0, Math.round(drawnFt) - gateFt);
    var fLo = fenceFt * per[0], fHi = fenceFt * per[1];
    var rLo = sel.removal ? Math.round(drawnFt) * P.removalPerFt[0] : 0;
    var rHi = sel.removal ? Math.round(drawnFt) * P.removalPerFt[1] : 0;
    var lo = fLo + gLo + rLo, hi = fHi + gHi + rHi;
    var minApplied = lo < P.minimumJob;
    lo = Math.max(lo, P.minimumJob);
    hi = Math.max(hi, P.minimumJob);
    var r = P.roundTo || 50;
    lo = Math.floor(lo / r) * r;
    hi = Math.ceil(hi / r) * r;
    return {
      lo: lo, hi: hi, height: h, per: per, fenceFt: fenceFt, gateFt: gateFt,
      fence: [fLo, fHi], gate: [gLo, gHi], removal: [rLo, rHi], minApplied: minApplied
    };
  }

  /* ---------- the example home (feet: 160 wide x 100 deep) ---------- */

  function hipRoof(x, y, w, hgt, fill, stroke) {
    var inset = Math.min(w, hgt) / 2, r0, r1;
    if (w >= hgt) { r0 = [x + inset, y + hgt / 2]; r1 = [x + w - inset, y + hgt / 2]; }
    else { r0 = [x + w / 2, y + inset]; r1 = [x + w / 2, y + hgt - inset]; }
    var s = '<rect x="' + (x + 1.3) + '" y="' + (y + 1.5) + '" width="' + w + '" height="' + hgt + '" fill="#000000" fill-opacity=".18"/>';
    s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hgt + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width=".45"/>';
    var corners = w >= hgt
      ? [[x, y, r0], [x, y + hgt, r0], [x + w, y, r1], [x + w, y + hgt, r1]]
      : [[x, y, r0], [x + w, y, r0], [x, y + hgt, r1], [x + w, y + hgt, r1]];
    var d = "M" + r0[0] + " " + r0[1] + "L" + r1[0] + " " + r1[1];
    corners.forEach(function (c) { d += "M" + c[0] + " " + c[1] + "L" + c[2][0] + " " + c[2][1]; });
    s += '<path d="' + d + '" stroke="' + stroke + '" stroke-width=".4" fill="none"/>';
    return s;
  }
  function palm(cx, cy, r, rot) {
    var s = '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ')">';
    for (var i = 0; i < 9; i++) {
      s += '<ellipse cx="' + (r * 0.5).toFixed(2) + '" cy="0" rx="' + (r * 0.54).toFixed(2) + '" ry="' + (r * 0.17).toFixed(2) +
        '" transform="rotate(' + i * 40 + ')" fill="' + (i % 2 ? "#3b7639" : "#4b8a43") + '"/>';
    }
    return s + '<circle r="' + (r * 0.16).toFixed(2) + '" fill="#7a6847"/></g>';
  }
  function canopy(cx, cy, r) {
    return '<circle cx="' + (cx + 1.4) + '" cy="' + (cy + 1.6) + '" r="' + r + '" fill="#000000" fill-opacity=".16"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#41713a"/>' +
      '<circle cx="' + (cx - r * 0.25) + '" cy="' + (cy - r * 0.25) + '" r="' + r * 0.62 + '" fill="#4f8443"/>' +
      '<circle cx="' + (cx - r * 0.35) + '" cy="' + (cy - r * 0.4) + '" r="' + r * 0.28 + '" fill="#5d924c"/>';
  }
  function hedge(x0, x1, y) {
    var s = "";
    for (var x = x0; x <= x1; x += 2.4) s += '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="1.45" fill="#4a7a3c"/>';
    return s;
  }

  function sceneMarkup(p) {
    return '' +
      '<defs>' +
      '<pattern id="' + p + 'g" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#79a055"/>' +
      '<path d="M1 2.2l.5-1M3.4 4.6l.45-1M4.3 1.4l.35-.9" stroke="#6a9147" stroke-width=".35" stroke-linecap="round"/></pattern>' +
      '<linearGradient id="' + p + 'w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#93dfec"/><stop offset="1" stop-color="#2b9dbb"/></linearGradient>' +
      '</defs>' +
      '<rect x="-60" y="-60" width="280" height="220" fill="url(#' + p + 'g)"/>' +
      '<rect x="-60" y="83" width="280" height="4" fill="#d8d3c8"/>' +
      '<rect x="-60" y="88.6" width="280" height="80" fill="#4a4e4b"/>' +
      '<path d="M-60 88.6H220" stroke="#bdb7aa" stroke-width=".55"/>' +
      '<path d="M-60 95.6H220" stroke="#e9e3c9" stroke-width=".45" stroke-dasharray="4 4"/>' +
      '<rect x="24" y="72" width="10" height="16.6" fill="#d3cfc5"/>' +
      '<rect x="126" y="70" width="10" height="18.6" fill="#d3cfc5"/>' +
      '<rect x="92" y="74" width="12" height="14.6" fill="#dad6cd"/>' +
      '<rect x="73" y="74" width="4" height="9" fill="#dad6cd"/>' +
      canopy(14, 14, 12) + canopy(147, 13, 11) +
      hipRoof(4, 40, 30, 32, "#cdc6b8", "#a8a090") +
      hipRoof(126, 38, 30, 32, "#d7d0c3", "#ada594") +
      '<rect x="60" y="9" width="30" height="35" rx="1" fill="#e6dbc5"/>' +
      '<rect x="64" y="13" width="22" height="15" rx="3" fill="url(#' + p + 'w)" stroke="#f6f1e6" stroke-width=".6"/>' +
      '<path d="M83 14.6h2.2M83 16.2h2.2M83 17.8h2.2" stroke="#e9f8fb" stroke-width=".35"/>' +
      hipRoof(56, 44, 48, 30, "#dccdb2", "#b5a385") +
      hedge(58, 70, 77.6) + hedge(80, 90, 77.6) +
      palm(50, 8, 6, 10) + palm(111, 9, 6.5, 25) + palm(49, 79, 5, 5) + palm(110.5, 79, 4.6, 30) +
      '<path d="M44 2V83M116 2V83M44 2H116" stroke="#ffffff" stroke-opacity=".6" stroke-width=".35" stroke-dasharray="1.6 1.1" fill="none"/>' +
      '<g transform="translate(152 7)"><circle r="4.2" fill="#ffffff" fill-opacity=".88"/>' +
      '<path d="M0-2.7L1.6 1.7 0 .8-1.6 1.7Z" fill="#14211b"/></g>' +
      '<g transform="translate(5 93.2)"><rect width="20" height="1.2" fill="#ffffff"/><rect width="10" height="1.2" fill="#14211b" fill-opacity=".6"/>' +
      '<text x="22.5" y="1.4" font-size="3" fill="#ffffff" font-family="Inter, system-ui, sans-serif">20 ft</text></g>';
  }

  // Ready-made layouts on the example home (points in feet)
  var LAYOUTS = {
    backyard: { runs: [[[56, 50], [45, 50], [45, 5], [115, 5], [115, 50], [104, 50]]], gates: [{ run: 0, seg: 0, t: 0.5, type: "walk" }] },
    leftAndBack: { runs: [[[56, 50], [45, 50], [45, 5], [115, 5]]], gates: [{ run: 0, seg: 0, t: 0.5, type: "walk" }] },
    frontYard: {
      runs: [[[56, 64], [45, 64], [45, 82], [115, 82], [115, 64], [104, 64]]],
      gates: [{ run: 0, seg: 2, t: 0.4286, type: "walk" }, { run: 0, seg: 2, t: 0.7571, type: "drive" }]
    }
  };

  /* ---------- geometry ---------- */

  function havFt(a, b) {
    var R = 6371008.8, k = Math.PI / 180;
    var dLat = (b[1] - a[1]) * k, dLon = (b[0] - a[0]) * k;
    var x = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a[1] * k) * Math.cos(b[1] * k) * Math.pow(Math.sin(dLon / 2), 2);
    return 2 * R * Math.asin(Math.sqrt(x)) * 3.28084;
  }
  function planeFt(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function runLength(run, dist) { var L = 0; for (var i = 0; i < run.length - 1; i++) L += dist(run[i], run[i + 1]); return L; }
  function totalLength(runs, dist) { return runs.reduce(function (s, r) { return s + runLength(r, dist); }, 0); }
  function pointSeg(p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
    var t = L2 ? clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2, 0, 1) : 0;
    return { t: t, d: Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t)) };
  }
  function allPoints(runs) {
    var out = [];
    runs.forEach(function (r) { r.forEach(function (q) { out.push(q); }); });
    return out;
  }

  /* ---------- fence overlay (live map, example home, and lead snapshots) ---------- */

  var INK = { fence: "#ffd45c", casing: "#16221c", post: "#fffaf0", gate: "#ff7a1a", label: "#16221c", labelText: "#ffffff", vertex: "#ffffff" };
  var SZ_SCREEN = { casing: 8, line: 3.6, post: 4.6, postStroke: 1.1, vertex: 5, gate: 7, font: 11, minLabelPx: 46 };
  var SZ_MINI = { casing: 6.5, line: 3, post: 3.8, postStroke: 1, vertex: 4, gate: 6, font: 10.5, minLabelPx: 40 };
  var SZ_SNAPSHOT = { casing: 2.4, line: 1.1, post: 1.45, postStroke: 0.32, vertex: 1.4, gate: 2.2, font: 3.3, minLabelPx: 9 };

  function overlayMarkup(st, v) {
    var sz = v.sz, lines = "", posts = "", gates = "", labels = "", verts = "";
    st.runs.forEach(function (run, ri) {
      if (!run.length) return;
      var pts = run.map(v.proj);
      if (pts.length > 1) {
        var d = "M" + pts.map(function (q) { return f1(q[0]) + " " + f1(q[1]); }).join("L");
        lines += '<path d="' + d + '" fill="none" stroke="' + INK.casing + '" stroke-opacity=".5" stroke-width="' + sz.casing + '" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="' + d + '" fill="none" stroke="' + INK.fence + '" stroke-width="' + sz.line + '" stroke-linecap="round" stroke-linejoin="round"/>';
      }
      for (var i = 0; i < run.length - 1; i++) {
        var a = run[i], b = run[i + 1], L = v.dist(a, b);
        var n = Math.max(1, Math.round(L / P.postSpacingFt));
        for (var k = (i === 0 ? 0 : 1); k <= n; k++) {
          var q = v.proj(v.interp(a, b, k / n));
          posts += '<rect x="' + f1(q[0] - sz.post / 2) + '" y="' + f1(q[1] - sz.post / 2) + '" width="' + sz.post + '" height="' + sz.post +
            '" fill="' + INK.post + '" stroke="' + INK.casing + '" stroke-width="' + sz.postStroke + '"/>';
        }
        var pa = pts[i], pb = pts[i + 1], segPx = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        if (L >= 5 && segPx >= sz.minLabelPx) {
          var txt = Math.round(L) + " ft";
          var w = txt.length * sz.font * 0.6 + sz.font * 1.1, hh = sz.font * 1.6;
          var nx = -(pb[1] - pa[1]) / segPx, ny = (pb[0] - pa[0]) / segPx, off = sz.font * 1.35;
          var lx = (pa[0] + pb[0]) / 2 + nx * off, ly = (pa[1] + pb[1]) / 2 + ny * off;
          labels += '<g transform="translate(' + f1(lx) + " " + f1(ly) + ')"><rect x="' + f1(-w / 2) + '" y="' + f1(-hh / 2) + '" width="' + f1(w) +
            '" height="' + f1(hh) + '" rx="' + f1(hh / 2) + '" fill="' + INK.label + '" fill-opacity=".86"/><text x="0" y="' + f1(sz.font * 0.36) +
            '" text-anchor="middle" font-size="' + sz.font + '" font-weight="600" fill="' + INK.labelText + '" font-family="Inter, system-ui, sans-serif">' + txt + "</text></g>";
        }
      }
      if (v.interactive) {
        var closing = st.active === ri && run.length >= 3;
        pts.forEach(function (q, qi) {
          if (closing && qi === 0) verts += '<circle class="tq-close-ring" cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="' + (sz.vertex + 6) + '" fill="none" stroke="' + INK.fence + '" stroke-width="2"/>';
          var last = st.active === ri && qi === pts.length - 1;
          verts += '<circle cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" r="' + (last ? sz.vertex + 1.5 : sz.vertex) + '" fill="' + (last ? INK.fence : INK.vertex) +
            '" stroke="' + INK.casing + '" stroke-width="1.6"/>';
        });
      }
    });
    st.gates.forEach(function (g) {
      var run = st.runs[g.run];
      if (!run || !run[g.seg + 1]) return;
      var a = run[g.seg], b = run[g.seg + 1], L = v.dist(a, b), G = P.gates[g.type];
      var half = (G.width / 2) / L;
      var p0 = v.proj(v.interp(a, b, clamp(g.t - half, 0, 1))), p1 = v.proj(v.interp(a, b, clamp(g.t + half, 0, 1)));
      var d = "M" + f1(p0[0]) + " " + f1(p0[1]) + "L" + f1(p1[0]) + " " + f1(p1[1]);
      gates += '<path d="' + d + '" stroke="' + INK.casing + '" stroke-width="' + (sz.gate + sz.postStroke * 2.4) + '"/>' +
        '<path d="' + d + '" stroke="' + INK.gate + '" stroke-width="' + sz.gate + '"/>';
    });
    if (v.interactive && st.active != null && st.hover && st.runs[st.active] && st.runs[st.active].length) {
      var lastPt = st.runs[st.active][st.runs[st.active].length - 1];
      var a2 = v.proj(lastPt), h = st.hover.screen;
      verts += '<path d="M' + f1(a2[0]) + " " + f1(a2[1]) + "L" + f1(h[0]) + " " + f1(h[1]) + '" stroke="' + INK.post + '" stroke-width="2" stroke-dasharray="5 5" fill="none"/>';
      var hl = Math.round(v.dist(lastPt, st.hover.world)) + " ft";
      verts += '<text x="' + f1(h[0] + 10) + '" y="' + f1(h[1] - 10) + '" font-size="12" font-weight="700" fill="' + INK.post + '" stroke="' + INK.casing +
        '" stroke-width="3" paint-order="stroke" font-family="Inter, system-ui, sans-serif">' + hl + "</text>";
    }
    return lines + gates + posts + verts + labels;
  }

  // Example-home lead: the drawing on the illustrated home
  function snapshotMarkup(layout) {
    var p = "tqs" + (++uid);
    var view = { proj: function (q) { return q; }, dist: planeFt, interp: lerp, sz: SZ_SNAPSHOT, interactive: false };
    return '<svg xmlns="' + SVGNS + '" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Fence layout drawn by the homeowner">' +
      sceneMarkup(p) + overlayMarkup({ runs: layout.runs, gates: layout.gates }, view) + "</svg>";
  }

  // Live lead without imagery: the drawn shape, to scale, on a plain grid
  function shapeMarkup(lead) {
    var pts = allPoints(lead.runs);
    if (!pts.length) return "";
    var lng0 = pts[0][0], lat0 = pts[0][1];
    var ky = 364567, kx = ky * Math.cos(lat0 * Math.PI / 180);
    var runs = lead.runs.map(function (r) { return r.map(function (q) { return [(q[0] - lng0) * kx, -(q[1] - lat0) * ky]; }); });
    var xs = [], ys = [];
    allPoints(runs).forEach(function (q) { xs.push(q[0]); ys.push(q[1]); });
    var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs), minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    var w = Math.max(maxX - minX, 20), h = Math.max(maxY - minY, 12), pad = Math.max(w, h) * 0.2;
    var vbW = w + pad * 2, vbH = h + pad * 2;
    if (vbW / vbH > 1.6) vbH = vbW / 1.6; else vbW = vbH * 1.6;
    var vx = (minX + maxX) / 2 - vbW / 2, vy = (minY + maxY) / 2 - vbH / 2;
    var s = vbW / 160, sz = {};
    Object.keys(SZ_SNAPSHOT).forEach(function (k) { sz[k] = SZ_SNAPSHOT[k] * s; });
    var p = "tqg" + (++uid), step = 10;
    var view = { proj: function (q) { return q; }, dist: planeFt, interp: lerp, sz: sz, interactive: false };
    return '<svg xmlns="' + SVGNS + '" viewBox="' + [vx, vy, vbW, vbH].map(f1).join(" ") + '" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Fence layout drawn by the homeowner, to scale">' +
      '<defs><pattern id="' + p + '" width="' + step + '" height="' + step + '" patternUnits="userSpaceOnUse"><path d="M' + step + ' 0H0V' + step + '" fill="none" class="tq-shape-grid" stroke-width="' + f1(0.35 * s) + '"/></pattern></defs>' +
      '<rect x="' + f1(vx) + '" y="' + f1(vy) + '" width="' + f1(vbW) + '" height="' + f1(vbH) + '" class="tq-shape-bg"/>' +
      '<rect x="' + f1(vx) + '" y="' + f1(vy) + '" width="' + f1(vbW) + '" height="' + f1(vbH) + '" fill="url(#' + p + ')"/>' +
      overlayMarkup({ runs: runs, gates: lead.gates }, view) + "</svg>";
  }

  /* ---------- tap and hover on the example home ---------- */

  function attachTap(el, toLocal, handlers) {
    var down = null;
    el.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener("pointerup", function (e) {
      if (!down) return;
      var moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 8) return;
      var loc = toLocal(e.clientX, e.clientY);
      handlers.tap(loc.world, loc.screen);
    });
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var loc = toLocal(e.clientX, e.clientY);
      handlers.hover(loc.world, loc.screen);
    });
    el.addEventListener("pointerleave", function () { handlers.hover(null, null); });
  }

  function SampleSurface(host, handlers) {
    var p = "tqh" + (++uid);
    host.innerHTML = '<svg class="tq-scene" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" role="img" aria-label="An example home seen from above, with a pool in the backyard">' +
      sceneMarkup(p) + '</svg><svg class="tq-overlay" aria-hidden="true"></svg>';
    var scene = host.querySelector(".tq-scene");
    var overlay = host.querySelector(".tq-overlay");

    function project(q) {
      var m = scene.getScreenCTM(), r = host.getBoundingClientRect();
      if (!m) return [0, 0];
      return [m.a * q[0] + m.c * q[1] + m.e - r.left, m.b * q[0] + m.d * q[1] + m.f - r.top];
    }
    function toLocal(cx, cy) {
      var m = scene.getScreenCTM(), r = host.getBoundingClientRect();
      var inv = m.inverse();
      var world = [inv.a * cx + inv.c * cy + inv.e, inv.b * cx + inv.d * cy + inv.f];
      world = [clamp(Math.round(world[0] * 2) / 2, 0, 160), clamp(Math.round(world[1] * 2) / 2, 0, 100)];
      return { world: world, screen: [cx - r.left, cy - r.top] };
    }
    attachTap(scene, toLocal, handlers);
    var ro = new ResizeObserver(function () { handlers.redraw(); });
    ro.observe(host);

    return {
      kind: "sample",
      overlay: overlay,
      project: project,
      dist: planeFt,
      interp: lerp,
      ready: Promise.resolve(),
      zoom: function () { return Infinity; },
      destroy: function () { ro.disconnect(); host.innerHTML = ""; }
    };
  }

  /* ---------- live satellite map (Mapbox) ---------- */

  var PIN_SVG = '<svg viewBox="0 0 28 38" width="28" height="38" aria-hidden="true"><path d="M14 36.5S26 23.2 26 13.6A12 12 0 0 0 2 13.6C2 23.2 14 36.5 14 36.5Z" fill="#0f5a43" stroke="#ffffff" stroke-width="2"/><circle cx="14" cy="13.6" r="4.4" fill="#ffffff"/></svg>';

  var mapboxLoading = null;
  function loadMapbox() {
    if (window.mapboxgl) return Promise.resolve();
    if (mapboxLoading) return mapboxLoading;
    mapboxLoading = new Promise(function (resolve, reject) {
      var base = "https://cdn.jsdelivr.net/npm/mapbox-gl@" + MAPBOX_VERSION + "/dist/";
      var css = document.createElement("link");
      css.rel = "stylesheet"; css.href = base + "mapbox-gl.css";
      document.head.appendChild(css);
      var js = document.createElement("script");
      js.src = base + "mapbox-gl.js";
      js.onload = function () { if (window.mapboxgl) resolve(); else reject(new Error("map script")); };
      js.onerror = function () { mapboxLoading = null; reject(new Error("map script")); };
      document.head.appendChild(js);
    });
    return mapboxLoading;
  }

  function isFatalMapError(e) {
    var err = e && e.error;
    if (!err) return false;
    var status = err.status || 0;
    return status === 401 || status === 403 || /style|token|unauthori|forbidden|webgl|context/i.test(String(err.message || ""));
  }

  // Resolves once the map has drawn, rejects if it can't load within 15 seconds.
  function whenMapLoads(map) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var timer = setTimeout(function () { if (!done) { done = true; reject(new Error("timeout")); } }, 15000);
      map.once("load", function () { if (!done) { done = true; clearTimeout(timer); resolve(); } });
      map.on("error", function (e) {
        if (!done && isFatalMapError(e)) { done = true; clearTimeout(timer); reject(new Error("map")); }
      });
    });
  }

  function MapboxSurface(host, handlers, opts) {
    opts = opts || {};
    host.innerHTML = '<div class="tq-map"></div>';
    var mapEl = host.querySelector(".tq-map");
    var overlay = document.createElementNS(SVGNS, "svg");
    overlay.setAttribute("class", "tq-overlay");
    overlay.setAttribute("aria-hidden", "true");
    var map = null, pin = null, dead = false;

    function setPin(center) {
      if (!map || !center) return;
      if (!pin) {
        var el = document.createElement("div");
        el.className = "tq-pin";
        el.innerHTML = PIN_SVG;
        pin = new window.mapboxgl.Marker({ element: el, anchor: "bottom" });
      }
      pin.setLngLat(center).addTo(map);
    }

    var ready = loadMapbox().then(function () {
      if (dead) throw new Error("closed");
      var gl = window.mapboxgl;
      gl.accessToken = TOKEN;
      map = new gl.Map({
        container: mapEl,
        style: MAP_STYLE,
        center: opts.center || CFG.mapCenter,
        zoom: opts.center ? HOME_ZOOM : (CFG.mapStartZoom || 11),
        maxZoom: 21.5,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        doubleClickZoom: false,
        cooperativeGestures: !!opts.cooperative
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new gl.NavigationControl({ showCompass: false }), "bottom-right");
      map.getCanvasContainer().appendChild(overlay);
      setPin(opts.center);
      map.on("click", function (e) { handlers.tap([e.lngLat.lng, e.lngLat.lat], [e.point.x, e.point.y]); });
      map.on("mousemove", function (e) { handlers.hover([e.lngLat.lng, e.lngLat.lat], [e.point.x, e.point.y]); });
      map.on("mouseout", function () { handlers.hover(null, null); });
      map.on("move", function () { handlers.redraw(); });
      map.on("resize", function () { handlers.redraw(); });
      return whenMapLoads(map);
    });

    return {
      kind: "map",
      overlay: overlay,
      project: function (q) { if (!map) return [0, 0]; var pt = map.project(q); return [pt.x, pt.y]; },
      dist: havFt,
      interp: lerp,
      ready: ready,
      zoom: function () { return map ? map.getZoom() : 0; },
      goTo: function (center) {
        if (!map) return;
        map.flyTo({ center: center, zoom: HOME_ZOOM, speed: 1.6, essential: true });
        setPin(center);
      },
      clearPin: function () { if (pin) pin.remove(); },
      destroy: function () { dead = true; if (map) map.remove(); map = null; host.innerHTML = ""; }
    };
  }

  // Contractor view: the lead's yard on satellite, with the fence they drew.
  function renderLeadMap(el, lead) {
    var noop = { destroy: function () {} };
    if (!el || !lead) return noop;
    if (lead.mode !== "map") { el.innerHTML = snapshotMarkup(lead); return noop; }
    var pts = allPoints(lead.runs);
    if (!LIVE || !pts.length) { el.innerHTML = shapeMarkup(lead); return noop; }

    el.innerHTML = '<div class="tq-leadmap"></div>';
    var box = el.firstChild, map = null, dead = false;
    var overlay = document.createElementNS(SVGNS, "svg");
    overlay.setAttribute("class", "tq-overlay");
    overlay.setAttribute("aria-hidden", "true");

    function fallback() {
      if (dead) return;
      dead = true;
      if (map) { map.remove(); map = null; }
      el.innerHTML = shapeMarkup(lead);
    }

    loadMapbox().then(function () {
      if (dead) return;
      var gl = window.mapboxgl;
      gl.accessToken = TOKEN;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      pts.forEach(function (q) { minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]); minY = Math.min(minY, q[1]); maxY = Math.max(maxY, q[1]); });
      map = new gl.Map({
        container: box,
        style: MAP_STYLE,
        bounds: [[minX, minY], [maxX, maxY]],
        fitBoundsOptions: { padding: 44, maxZoom: 20 },
        interactive: false
      });
      map.getCanvasContainer().appendChild(overlay);
      var draw = function () {
        if (!map) return;
        overlay.innerHTML = overlayMarkup({ runs: lead.runs, gates: lead.gates }, {
          proj: function (q) { var p = map.project(q); return [p.x, p.y]; },
          dist: havFt, interp: lerp, sz: SZ_MINI, interactive: false
        });
      };
      map.on("move", draw);
      map.on("resize", draw);
      whenMapLoads(map).then(draw, fallback);
    }).catch(fallback);

    return { destroy: function () { dead = true; if (map) { map.remove(); map = null; } } };
  }

  /* ---------- address search (Mapbox geocoding) ---------- */

  var geoCache = {};
  function geocode(q) {
    var key = q.toLowerCase();
    if (geoCache[key]) return Promise.resolve(geoCache[key]);
    var c = CFG.mapCenter || [-80.1918, 25.7617];
    var url = "https://api.mapbox.com/search/geocode/v6/forward?q=" + encodeURIComponent(q) +
      "&country=" + encodeURIComponent(CFG.searchCountry || "us") + "&types=address&limit=5&autocomplete=true&language=en" +
      "&proximity=" + c[0] + "," + c[1] + "&access_token=" + encodeURIComponent(TOKEN);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("search " + r.status);
      return r.json();
    }).then(function (data) {
      var items = (data.features || []).map(function (f) {
        var pr = f.properties || {};
        return {
          // The search is limited to one country, so drop the country name from the end.
          label: (pr.full_address || [pr.name, pr.place_formatted].filter(Boolean).join(", ")).replace(/,\s*United States( of America)?$/i, ""),
          center: f.geometry && f.geometry.coordinates
        };
      }).filter(function (s) { return s.label && s.center; });
      geoCache[key] = items;
      return items;
    });
  }

  /* ---------- lead hand-off between pages ---------- */

  var LEAD_KEY = "tqDemoLead";
  function saveLead(lead) {
    api.lastLead = lead;
    try { sessionStorage.setItem(LEAD_KEY, JSON.stringify(lead)); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new CustomEvent("tq:lead", { detail: lead }));
  }
  function loadLead() {
    if (api.lastLead) return api.lastLead;
    try { var raw = sessionStorage.getItem(LEAD_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  /* ---------- products: colors, pictures, monthly payments ---------- */

  function shade(hex, amt) {
    var n = parseInt(String(hex).replace("#", ""), 16);
    if (isNaN(n)) return hex;
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function colorHex(mat, name) {
    var list = mat.colors || [];
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i].hex;
    return list.length ? list[0].hex : "#cccccc";
  }
  function monthlyPayment(amount) {
    var F = CFG.financing;
    if (!F || !F.show || !F.months) return 0;
    var r = (F.apr || 0) / 100 / 12, n = F.months;
    return Math.ceil(r ? amount * r / (1 - Math.pow(1 + r, -n)) : amount / n);
  }

  // A front view of the fence, drawn in the chosen color and height.
  function fenceArt(kind, hex, heightFt, extraClass) {
    var ground = 104, h = Math.round(clamp(heightFt || 6, 3, 8) / 8 * 80), top = ground - h;
    var dark = shade(hex, -0.3), light = shade(hex, 0.16), posts = [16, 120, 224];
    var s = '<svg class="tq-art' + (extraClass ? " " + extraClass : "") + '" viewBox="0 0 240 120" aria-hidden="true">' +
      '<rect width="240" height="120" fill="#e6edf0"/><rect width="240" height="40" fill="#dbe6ea"/>' +
      '<rect y="' + ground + '" width="240" height="16" fill="#8db26b"/><rect y="' + ground + '" width="240" height="2" fill="#759c55"/>';
    var x, i;
    if (kind === "wood") {
      posts.forEach(function (p) { s += '<rect x="' + (p - 4) + '" y="' + (top + 6) + '" width="8" height="' + (h - 6) + '" fill="' + dark + '"/>'; });
      for (x = 10; x < 230; x += 9) {
        s += '<path d="M' + x + " " + (top + 3) + "L" + (x + 2) + " " + top + "H" + (x + 7) + "L" + (x + 9) + " " + (top + 3) + "V" + ground + "H" + x + 'Z" fill="' + hex + '" stroke="' + dark + '" stroke-width=".8"/>';
        s += '<path d="M' + (x + 3) + " " + (top + 14) + "c1 6 1 12 0 18" + '" stroke="' + shade(hex, -0.12) + '" stroke-width=".6" fill="none"/>';
      }
    } else if (kind === "vinyl") {
      for (i = 0; i < posts.length - 1; i++) {
        var x0 = posts[i] + 5, x1 = posts[i + 1] - 5;
        s += '<rect x="' + x0 + '" y="' + (top + 7) + '" width="' + (x1 - x0) + '" height="' + (h - 9) + '" fill="' + hex + '" stroke="' + dark + '" stroke-width=".8"/>';
        for (x = x0 + 7; x < x1 - 2; x += 7) s += '<path d="M' + x + " " + (top + 9) + "V" + (ground - 2) + '" stroke="' + shade(hex, -0.1) + '" stroke-width=".7"/>';
        s += '<rect x="' + x0 + '" y="' + (top + 3) + '" width="' + (x1 - x0) + '" height="5" fill="' + light + '" stroke="' + dark + '" stroke-width=".8"/>';
      }
      posts.forEach(function (p) {
        s += '<rect x="' + (p - 5) + '" y="' + (top - 1) + '" width="10" height="' + (h + 1) + '" fill="' + light + '" stroke="' + dark + '" stroke-width=".8"/>' +
          '<rect x="' + (p - 6.5) + '" y="' + (top - 5) + '" width="13" height="5" rx="1" fill="' + hex + '" stroke="' + dark + '" stroke-width=".8"/>';
      });
    } else if (kind === "aluminum") {
      for (x = 12; x <= 228; x += 7) {
        s += '<rect x="' + x + '" y="' + (top + 2) + '" width="2.2" height="' + (h - 4) + '" fill="' + hex + '"/>' +
          '<path d="M' + (x - 0.6) + " " + (top + 2) + "L" + (x + 1.1) + " " + (top - 2) + "L" + (x + 2.8) + " " + (top + 2) + 'Z" fill="' + hex + '"/>';
      }
      s += '<rect x="8" y="' + (top + 7) + '" width="224" height="3.2" fill="' + hex + '"/>' +
        '<rect x="8" y="' + (ground - 11) + '" width="224" height="3.2" fill="' + hex + '"/>';
      posts.forEach(function (p) { s += '<rect x="' + (p - 3) + '" y="' + (top - 3) + '" width="6" height="' + (h + 3) + '" fill="' + hex + '"/>'; });
    } else {
      var pid = "tqm" + (++uid);
      s += '<defs><pattern id="' + pid + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H7M0 0V7" stroke="' + hex + '" stroke-width="1.1" fill="none"/></pattern></defs>' +
        '<rect x="16" y="' + (top + 4) + '" width="208" height="' + (h - 5) + '" fill="url(#' + pid + ')"/>' +
        '<rect x="10" y="' + (top + 1) + '" width="220" height="3.4" rx="1.7" fill="' + dark + '"/>';
      posts.forEach(function (p) {
        s += '<rect x="' + (p - 2.6) + '" y="' + top + '" width="5.2" height="' + h + '" fill="' + dark + '"/>' +
          '<circle cx="' + p + '" cy="' + top + '" r="3.4" fill="' + dark + '"/>';
      });
    }
    return s + "</svg>";
  }

  /* ---------- the widget ---------- */

  function nextVisitDays() {
    var out = [], d = new Date();
    while (out.length < 3) {
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      var dow = d.getDay();
      if (dow !== 0 && dow !== 6) out.push(d);
    }
    return out;
  }
  function dayLabel(d) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }

  function mount(root, opts) {
    opts = opts || {};
    var id = "tq" + (++uid);
    var layout = opts.layout === "full" ? "full" : "compact";
    var live = LIVE;

    var st = {
      runs: [], gates: [], active: null, history: [], hover: null,
      tool: "draw", gateType: "walk",
      material: P.defaultMaterial, heightBy: {}, colorBy: {}, removal: false,
      contact: { first: "", last: "", email: "", phone: "", consent: false }, timing: "", submitted: false, intent: "quote",
      address: null, addrDraft: "", loading: false,
      step: live ? "address" : "draw",
      visitDay: 0, visitTime: "Morning", visitRequested: false, lead: null, errors: {}
    };

    root.classList.add("tq", "tq--" + layout);
    root.innerHTML =
      '<div class="tq-stage">' +
      '<div class="tq-surface"></div>' +
      '<div class="tq-hud"><span class="tq-hud-chip" data-ref="where"></span><span class="tq-hud-total" data-ref="total" aria-live="polite"></span></div>' +
      '<div class="tq-toast" data-ref="toast" role="status" hidden></div>' +
      "</div>" +
      '<div class="tq-panel">' +
      '<ol class="tq-steps" data-ref="steps"></ol>' +
      '<div class="tq-body" data-ref="body"></div>' +
      '<div class="tq-actions" data-ref="actions"></div>' +
      "</div>";

    function ref(name) { return root.querySelector('[data-ref="' + name + '"]'); }
    var surfaceHost = root.querySelector(".tq-surface");
    var surface = null;
    var toastTimer = null;

    function steps() { return live ? ["address", "draw", "quote", "details"] : ["draw", "quote", "details"]; }
    var STEP_NAMES = { address: "Address", draw: "Draw", quote: "Quote", details: "Details" };

    function heightFor(mid) { var m = materialById(mid); return heightOrDefault(m, st.heightBy[mid]); }
    function colorFor(mid) { var m = materialById(mid); return st.colorBy[mid] || (m.colors && m.colors.length ? m.colors[0].name : ""); }
    function drawnFt() { return surface ? totalLength(st.runs, surface.dist) : 0; }
    function quoteFor(mid) { return priceFor(drawnFt(), st.gates, { material: mid, height: heightFor(mid), removal: st.removal }); }
    function postCount() {
      var n = 0;
      st.runs.forEach(function (run) {
        if (run.length < 2) return;
        for (var i = 0; i < run.length - 1; i++) n += Math.max(1, Math.round(surface.dist(run[i], run[i + 1]) / P.postSpacingFt));
        var a = run[0], b = run[run.length - 1];
        if (a[0] !== b[0] || a[1] !== b[1]) n += 1;
      });
      return n;
    }

    function toast(msg, ms) {
      var t = ref("toast");
      t.textContent = msg;
      t.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { t.hidden = true; }, ms || 3200);
    }
    function updateWhere() {
      if (!surface) return;
      ref("where").textContent = st.loading ? "Loading satellite view…" : surface.kind === "map" ? "Satellite view" : "Example home";
    }

    /* ----- drawing ----- */

    function redraw() {
      if (!surface) return;
      var view = { proj: surface.project, dist: surface.dist, interp: surface.interp, sz: SZ_SCREEN, interactive: st.step === "draw" };
      surface.overlay.innerHTML = overlayMarkup(st, view);
      var total = drawnFt();
      ref("total").innerHTML = total > 0 ? "<b>" + Math.round(total).toLocaleString("en-US") + "</b> ft" : "";
      ref("total").hidden = total <= 0;
      if (st.step === "draw") updateDrawMeter();
    }

    function nearestVertex(screen, maxPx) {
      var best = null;
      st.runs.forEach(function (run, ri) {
        run.forEach(function (q, qi) {
          var s = surface.project(q), d = Math.hypot(s[0] - screen[0], s[1] - screen[1]);
          if (d <= maxPx && (!best || d < best.d)) best = { d: d, point: q.slice(), run: ri, index: qi };
        });
      });
      return best;
    }
    function nearestSegment(screen, maxPx) {
      var best = null;
      st.runs.forEach(function (run, ri) {
        for (var i = 0; i < run.length - 1; i++) {
          var a = surface.project(run[i]), b = surface.project(run[i + 1]);
          var hit = pointSeg(screen, a, b);
          if (hit.d <= maxPx && (!best || hit.d < best.d)) best = { d: hit.d, t: hit.t, run: ri, seg: i };
        }
      });
      return best;
    }

    function onTap(world, screen) {
      if (st.step !== "draw" || !world || st.loading) return;
      if (surface.zoom() < MIN_DRAW_ZOOM) { toast("Zoom in closer to the yard before you draw."); return; }
      if (st.tool === "gate") {
        var hit = nearestSegment(screen, 26);
        if (!hit) { toast("Tap right on a fence line to place the gate."); return; }
        var run = st.runs[hit.run], a = run[hit.seg], b = run[hit.seg + 1];
        var L = surface.dist(a, b), G = P.gates[st.gateType];
        if (L < G.width + 1) { toast("That section is " + Math.round(L) + " ft. A " + G.width + " ft gate needs more room."); return; }
        var half = (G.width / 2) / L;
        st.gates.push({ run: hit.run, seg: hit.seg, t: clamp(hit.t, half, 1 - half), type: st.gateType });
        st.history.push({ t: "gate" });
        redraw();
        return;
      }
      var snap = nearestVertex(screen, 14);
      if (st.active == null) {
        st.runs.push([snap ? snap.point : world]);
        st.active = st.runs.length - 1;
        st.history.push({ t: "start", run: st.active });
        if (surface.clearPin) surface.clearPin();
      } else {
        var cur = st.runs[st.active];
        if (cur.length >= 3) {
          var first = surface.project(cur[0]);
          if (Math.hypot(first[0] - screen[0], first[1] - screen[1]) < 18) {
            cur.push(cur[0].slice());
            st.history.push({ t: "close", run: st.active });
            st.active = null;
            redraw();
            return;
          }
        }
        var lastS = surface.project(cur[cur.length - 1]);
        if (Math.hypot(lastS[0] - screen[0], lastS[1] - screen[1]) < 6) return;
        cur.push(snap ? snap.point : world);
        st.history.push({ t: "pt", run: st.active });
      }
      redraw();
    }

    function undo() {
      var last = st.history.pop();
      if (!last) return;
      if (last.t === "gate") st.gates.pop();
      else if (last.t === "close") { st.runs[last.run].pop(); st.active = last.run; }
      else if (last.t === "pt") { st.runs[last.run].pop(); st.active = last.run; }
      else if (last.t === "start") { st.runs.splice(last.run, 1); st.active = null; }
      else if (last.t === "newline") { st.active = last.prev; }
      st.gates = st.gates.filter(function (g) { return st.runs[g.run] && st.runs[g.run][g.seg + 1]; });
      redraw();
    }
    function newLine() {
      if (st.active == null) return;
      st.history.push({ t: "newline", prev: st.active });
      st.active = null;
      redraw();
    }
    function clearAll() {
      st.runs = []; st.gates = []; st.active = null; st.history = [];
      redraw();
    }
    function loadLayout(lay) {
      st.runs = []; st.gates = []; st.active = null; st.history = [];
      lay.runs.forEach(function (run) {
        st.runs.push([]);
        var ri = st.runs.length - 1;
        run.forEach(function (q, i) {
          st.runs[ri].push(q.slice());
          st.history.push(i === 0 ? { t: "start", run: ri } : { t: "pt", run: ri });
        });
      });
      lay.gates.forEach(function (g) { st.gates.push(copy(g)); st.history.push({ t: "gate" }); });
      redraw();
    }

    function useExample() {
      st.address = null;
      if (!surface || surface.kind !== "sample") setSurface("sample");
      loadLayout(LAYOUTS.backyard);
      go("draw");
    }

    function setSurface(kind, sopts) {
      if (surface) surface.destroy();
      var handlers = {
        tap: onTap,
        hover: function (world, screen) {
          st.hover = world ? { world: world, screen: screen } : null;
          if (st.active != null) redraw();
        },
        redraw: redraw
      };
      surface = kind === "map"
        ? MapboxSurface(surfaceHost, handlers, { center: sopts && sopts.center, cooperative: layout === "compact" })
        : SampleSurface(surfaceHost, handlers);
      root.classList.toggle("tq--map", kind === "map");
      st.loading = kind === "map";
      updateWhere();
      if (kind !== "map") return;
      var mine = surface;
      surface.ready.then(function () {
        if (surface !== mine) return;
        st.loading = false;
        updateWhere();
        redraw();
        if (st.step === "draw") toast("Tap each corner of the fence. Tap the first corner again to close it.", 4200);
      }, function () {
        if (surface !== mine) return;
        st.loading = false;
        live = false;
        setSurface("sample");
        useExample();
        toast("The satellite map couldn't load, so this shows the example home.", 4200);
      });
    }

    function pickAddress(item) {
      st.address = item;
      st.addrDraft = item.label;
      st.runs = []; st.gates = []; st.active = null; st.history = [];
      st.tool = "draw";
      if (surface && surface.kind === "map" && !st.loading) {
        surface.goTo(item.center);
        go("draw");
        toast("Tap each corner of the fence. Tap the first corner again to close it.", 4200);
      } else {
        setSurface("map", { center: item.center });
        go("draw");
      }
    }

    /* ----- steps ----- */

    function go(step) {
      var prev = st.step;
      st.step = step;
      st.errors = {};
      if (step !== "draw") st.hover = null;
      render();
      redraw();
      if (prev !== step) bringIntoView(root.querySelector(step === "draw" ? ".tq-stage" : ".tq-panel"));
    }
    // On phones the map sits above the panel; keep whatever the homeowner needs next on screen.
    function bringIntoView(el) {
      if (!el) return;
      var stage = root.querySelector(".tq-stage").getBoundingClientRect(), panel = root.querySelector(".tq-panel").getBoundingClientRect();
      if (stage.bottom > panel.top + 2) return;
      var r = el.getBoundingClientRect();
      if (r.top >= 70 && r.top <= window.innerHeight - 140) return;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    function stepIndex() { return steps().indexOf(st.step); }

    function renderSteps() {
      var list = steps(), idx = stepIndex();
      ref("steps").innerHTML = list.map(function (s, i) {
        var cls = i < idx ? "is-done" : i === idx ? "is-current" : "";
        return '<li class="' + cls + '"' + (i === idx ? ' aria-current="step"' : "") + '><span class="tq-step-num">' + (i + 1) + '</span><span class="tq-step-name">' + STEP_NAMES[s] + "</span></li>";
      }).join("");
    }

    function updateDrawMeter() {
      var m = root.querySelector('[data-ref="meter"]');
      if (!m) return;
      var total = drawnFt();
      var g = gateSummary(st.gates);
      m.innerHTML = total > 0
        ? "<b>" + ftLabel(total) + "</b> of fence drawn" + (g ? " · " + g : "")
        : "Nothing drawn yet";
      var next = root.querySelector('[data-act="next"]');
      if (next) next.disabled = total < 10 || st.loading;
      var undoBtn = root.querySelector('[data-act="undo"]');
      if (undoBtn) undoBtn.disabled = !st.history.length;
    }

    function bodyAddress() {
      return '<p class="tq-lede">Where is the fence going?</p>' +
        '<div class="tq-search">' +
        '<label class="tq-label" for="' + id + '-addr">Home address</label>' +
        '<input id="' + id + '-addr" class="tq-input tq-input--lg" type="text" autocomplete="off" spellcheck="false" placeholder="Start typing your street address" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="' + id + '-sugg" value="' + esc(st.addrDraft) + '">' +
        '<ul id="' + id + '-sugg" class="tq-sugg" role="listbox" aria-label="Matching addresses"></ul>' +
        "</div>" +
        '<p class="tq-help">Pick your address and the map zooms in to your home on satellite imagery.</p>' +
        '<button type="button" class="tq-link" data-act="use-sample">Try it on the example home instead</button>';
    }

    function bodyDraw() {
      var gateTypes = Object.keys(P.gates).map(function (k) {
        var G = P.gates[k];
        return '<button type="button" class="tq-chip-btn" data-gate="' + k + '" aria-pressed="' + (st.gateType === k) + '">' + esc(G.label) + " · " + G.width + " ft</button>";
      }).join("");
      var onMap = surface && surface.kind === "map";
      var help = st.tool === "gate"
        ? '<p class="tq-help">Pick a gate, then tap the fence line where it goes.</p>'
        : '<p class="tq-help">Tap each corner along the fence. Tap the first corner again to close a loop.' +
          (onMap ? " Drag to move the map and zoom in for a closer look." : "") + "</p>";
      var where = live
        ? (onMap
          ? '<p class="tq-where"><span>' + esc(st.address ? st.address.label : "Your home") + '</span><button type="button" class="tq-link" data-act="change-address">Change address</button></p>'
          : '<p class="tq-where"><span>This is an example home.</span><button type="button" class="tq-link" data-act="change-address">Search your address</button></p>')
        : "";
      return where +
        '<div class="tq-toolbar" role="toolbar" aria-label="Drawing tools">' +
        '<div class="tq-seg" role="group" aria-label="Tool">' +
        '<button type="button" data-tool="draw" aria-pressed="' + (st.tool === "draw") + '">Fence line</button>' +
        '<button type="button" data-tool="gate" aria-pressed="' + (st.tool === "gate") + '">Add gate</button>' +
        "</div>" +
        '<div class="tq-tool-row">' +
        '<button type="button" class="tq-mini" data-act="undo">Undo</button>' +
        '<button type="button" class="tq-mini" data-act="newline">New line</button>' +
        '<button type="button" class="tq-mini" data-act="clear">Clear</button>' +
        "</div></div>" +
        (st.tool === "gate" ? '<div class="tq-gates" role="group" aria-label="Gate type">' + gateTypes + "</div>" : "") +
        help +
        '<p class="tq-meter" data-ref="meter"></p>';
    }

    function selectedSummary() {
      var m = materialById(st.material), q = quoteFor(st.material), h = heightFor(st.material), color = colorFor(st.material);
      return '<div class="tq-pick">' + fenceArt(m.swatch, colorHex(m, color), +h, "tq-art--thumb") +
        '<span class="tq-prod-name"><b>' + esc(h + " ft " + m.name.toLowerCase()) + "</b><span>" +
        esc(color + " · " + ftLabel(q.fenceFt) + (st.gates.length ? " · " + gateSummary(st.gates) : "")) + "</span></span>" +
        '<span class="tq-prod-price"><b>' + moneyRange(q.lo, q.hi) + "</b></span></div>";
    }

    function visitChips() {
      var days = nextVisitDays();
      return '<div class="tq-days" role="group" aria-label="Day">' + days.map(function (d, i) {
        return '<button type="button" class="tq-chip-btn" data-day="' + i + '" aria-pressed="' + (st.visitDay === i) + '">' + esc(dayLabel(d)) + "</button>";
      }).join("") + "</div>" +
        '<div class="tq-days" role="group" aria-label="Time">' + ["Morning", "Afternoon"].map(function (t) {
          return '<button type="button" class="tq-chip-btn" data-time="' + t + '" aria-pressed="' + (st.visitTime === t) + '">' + t + "</button>";
        }).join("") + "</div>";
    }

    function bodyDetails() {
      if (st.submitted) return bodyDone();
      var c = st.contact, e = st.errors, measure = st.intent === "measure";
      var timing = (CFG.timingOptions || []).map(function (t) {
        return '<button type="button" class="tq-chip-btn" data-timing="' + esc(t) + '" aria-pressed="' + (st.timing === t) + '">' + esc(t) + "</button>";
      }).join("");
      function field(key, label, type, auto, extra) {
        return '<div class="tq-field"><label class="tq-label" for="' + id + "-" + key + '">' + label + "</label>" +
          '<input id="' + id + "-" + key + '" class="tq-input" type="' + type + '" autocomplete="' + auto + '"' + (extra || "") +
          ' value="' + esc(c[key]) + '"' + (e[key] ? ' aria-invalid="true"' : "") + ">" +
          (e[key] ? '<span class="tq-err">' + e[key] + "</span>" : "") + "</div>";
      }
      return '<p class="tq-lede">' + (measure ? "Book your free on-site measure" : "Get your detailed quote") + "</p>" +
        '<p class="tq-help">' + (measure
          ? "Pick a time and " + esc(COMPANY) + " will text you to confirm."
          : "We'll email you an itemized quote for this fence. " + esc(COMPANY) + " can follow up with any questions.") + "</p>" +
        selectedSummary() +
        '<div class="tq-fields">' +
        field("first", "First name", "text", "given-name") +
        field("last", "Last name", "text", "family-name") +
        field("email", "Email", "email", "email") +
        field("phone", "Mobile phone", "tel", "tel", ' inputmode="tel" placeholder="(305) 555-0123"') +
        "</div>" +
        (measure ? '<div class="tq-opt"><span class="tq-label">When should we come out?</span>' + visitChips() + "</div>" : "") +
        (timing ? '<div class="tq-opt"><span class="tq-label">When do you want it installed?</span><div class="tq-days" role="group" aria-label="Install timing">' + timing + "</div></div>" : "") +
        '<label class="tq-check"><input type="checkbox" id="' + id + '-consent"' + (c.consent ? " checked" : "") + ">" +
        "<span>Text me about my quote. Msg &amp; data rates may apply. Reply STOP to opt out.</span></label>" +
        '<p class="tq-fine">Demo: nothing you type here leaves this page.</p>';
    }

    function bodyDone() {
      var q = quoteFor(st.material), days = nextVisitDays();
      var head = st.intent === "measure"
        ? "<b>Thanks, " + esc(st.contact.first) + ". Your free measure is requested.</b> "
        : "<b>Your detailed quote is on its way, " + esc(st.contact.first) + ".</b> ";
      var visit = st.visitRequested
        ? '<div class="tq-done tq-done--quiet"><b>Free measure: ' + esc(dayLabel(days[st.visitDay])) + ", " + st.visitTime.toLowerCase() + ".</b> " + esc(COMPANY) + " would text you to confirm.</div>"
        : '<div class="tq-visit"><p class="tq-label">Want us to measure? It\'s free.</p>' + visitChips() + "</div>";
      return '<div class="tq-done" role="status">' + head + "It goes to " + esc(st.contact.email) + " and " + esc(formatPhone(st.contact.phone)) + ". In this demo, nothing is sent.</div>" +
        selectedSummary() +
        '<details class="tq-more" open><summary>Your itemized quote</summary><ul class="tq-lines">' + priceLines(st.material, q) + "</ul></details>" +
        visit +
        '<a class="tq-link" href="' + esc(opts.contractorHref || "demo.html#contractor") + '">See what the contractor gets →</a>';
    }

    function priceLines(mid, q) {
      var lines = [];
      lines.push("<li><span>" + ftLabel(q.fenceFt) + " of " + esc(styleLabel(mid, heightFor(mid))) + " at $" + q.per[0] + "–$" + q.per[1] + "/ft</span><b>" + moneyRange(q.fence[0], q.fence[1]) + "</b></li>");
      var counts = {};
      st.gates.forEach(function (g) { counts[g.type] = (counts[g.type] || 0) + 1; });
      Object.keys(counts).forEach(function (k) {
        var G = P.gates[k];
        lines.push("<li><span>" + plural(counts[k], G.label.toLowerCase(), G.label.toLowerCase() + "s") + "</span><b>" + moneyRange(G.price[0] * counts[k], G.price[1] * counts[k]) + "</b></li>");
      });
      if (st.removal) lines.push("<li><span>Old fence removal, " + ftLabel(drawnFt()) + "</span><b>" + moneyRange(q.removal[0], q.removal[1]) + "</b></li>");
      if (q.minApplied) lines.push("<li><span>Minimum job</span><b>" + money(P.minimumJob) + "</b></li>");
      return lines.join("");
    }

    function productDetail(m, q) {
      var h = heightFor(m.id), color = colorFor(m.id), d = m.details || {}, F = CFG.financing || {};
      var heights = Object.keys(m.heights).map(function (x) {
        return '<button type="button" class="tq-chip-btn" data-height="' + x + '" aria-pressed="' + (x === h) + '">' + x + " ft</button>";
      }).join("");
      var colors = (m.colors || []).map(function (c) {
        return '<button type="button" class="tq-color" data-color="' + esc(c.name) + '" aria-pressed="' + (c.name === color) + '"><i style="background:' + c.hex + '"></i>' + esc(c.name) + "</button>";
      }).join("");
      var facts = [["Typical lifespan", d.lifespan], ["Upkeep", d.upkeep], ["Privacy", d.privacy]].filter(function (f) { return f[1]; })
        .map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>"; }).join("");
      var lo = monthlyPayment(q.lo), hi = monthlyPayment(q.hi);
      return '<div class="tq-prod-body">' +
        '<div class="tq-art-wrap">' + fenceArt(m.swatch, colorHex(m, color), +h, "tq-art--big") + '<span class="tq-art-cap">' + esc(h + " ft " + m.name.toLowerCase() + ", " + color.toLowerCase()) + "</span></div>" +
        '<div class="tq-opt"><span class="tq-label">Height</span><div class="tq-heights" role="group" aria-label="Height">' + heights + "</div></div>" +
        (colors ? '<div class="tq-opt"><span class="tq-label">Color</span><div class="tq-colors" role="group" aria-label="Color">' + colors + "</div></div>" : "") +
        (facts ? '<dl class="tq-facts">' + facts + "</dl>" : "") +
        (lo ? '<div class="tq-finance"><div class="tq-finance-text"><b>' + money(lo) + "–" + money(hi) + "/mo</b><span>" + F.months + " months at " + F.apr + "% APR. " + esc(F.note || "") + "</span></div>" +
          '<button type="button" class="tq-mini" data-act="finance">Check my rate</button></div>' : "") +
        '<details class="tq-more"><summary>How this price adds up</summary><ul class="tq-lines">' + priceLines(m.id, q) + "</ul></details>" +
        "</div>";
    }

    // Installed price per linear foot for one material at one height, from the price sheet.
    function rateLabel(m, h) {
      var r = m.heights[h] || m.heights[m.defaultHeight];
      return r ? "$" + r[0] + "–$" + r[1] + " per ft installed" : "";
    }

    function bodyQuote() {
      var ft = drawnFt();
      var rows = P.materials.map(function (m) {
        var h = heightFor(m.id), q = quoteFor(m.id), on = m.id === st.material, mo = monthlyPayment(q.lo);
        return '<li class="tq-prod' + (on ? " is-on" : "") + '">' +
          '<button type="button" class="tq-prod-head" data-pick-mat="' + m.id + '" aria-expanded="' + on + '">' +
          fenceArt(m.swatch, colorHex(m, colorFor(m.id)), +h, "tq-art--thumb") +
          '<span class="tq-prod-name"><b>' + esc(m.name) + "</b><span>" + esc(h + " ft · " + m.note) + "</span>" +
          '<span class="tq-prod-rate">' + rateLabel(m, h) + "</span>" +
          (m.tier ? '<em class="tq-tier' + (m.id === P.defaultMaterial ? " tq-tier--hot" : "") + '">' + esc(m.tier) + "</em>" : "") + "</span>" +
          '<span class="tq-prod-price"><b>' + moneyRange(q.lo, q.hi) + "</b>" + (mo ? "<span>From " + money(mo) + "/mo</span>" : "") + "</span>" +
          "</button>" +
          (on ? productDetail(m, q) : "") +
          "</li>";
      }).join("");
      return '<div class="tq-quote-head">' +
        '<p class="tq-eyebrow">Your fence quote</p>' +
        '<p class="tq-quote-where">' + esc(st.address ? st.address.label : "Example home") + "</p>" +
        '<p class="tq-sum">' + ftLabel(ft) + " traced" + (st.gates.length ? " · " + gateSummary(st.gates) : "") + " · about " + postCount() + " posts " +
        '<button type="button" class="tq-link tq-link--inline" data-act="edit-drawing">Edit drawing</button></p>' +
        "</div>" +
        '<label class="tq-check"><input type="checkbox" id="' + id + '-removal"' + (st.removal ? " checked" : "") + ">" +
        "<span>Take out my old fence <small>+$" + P.removalPerFt[0] + "–$" + P.removalPerFt[1] + " per ft</small></span></label>" +
        '<p class="tq-label tq-label--flush">Choose a fence</p>' +
        '<ul class="tq-prods">' + rows + "</ul>" +
        '<p class="tq-fine">Prices come from a satellite measurement. ' + esc(COMPANY) + " confirms the final price after measuring on site.</p>";
    }

    function renderActions() {
      var a = ref("actions"), s = st.step, html = "";
      if (s === "draw") html = '<button type="button" class="tq-btn" data-act="next">See my price</button>';
      else if (s === "quote") {
        html = '<button type="button" class="tq-btn tq-btn--ghost" data-act="detail" data-intent="measure">Book a free measure</button>' +
          '<button type="button" class="tq-btn" data-act="detail" data-intent="quote">Get my detailed quote</button>';
      } else if (s === "details") {
        html = !st.submitted
          ? '<button type="button" class="tq-btn tq-btn--ghost" data-act="back">Back</button>' +
            '<button type="button" class="tq-btn" data-act="submit">' + (st.intent === "measure" ? "Request my free measure" : "Send my detailed quote") + "</button>"
          : '<button type="button" class="tq-btn tq-btn--ghost" data-act="restart">Start over</button>' +
            (st.visitRequested
              ? '<a class="tq-btn" href="' + esc(opts.contractorHref || "demo.html#contractor") + '" data-act="contractor">See what the contractor gets</a>'
              : '<button type="button" class="tq-btn" data-act="visit">Book my free measure</button>');
      }
      a.innerHTML = html;
      a.hidden = !html;
    }

    var FOCUS_KEYS = ["data-pick-mat", "data-height", "data-color", "data-timing", "data-day", "data-time", "data-tool", "data-gate", "data-act"];
    function render() {
      // Keep keyboard focus on the same control after the panel redraws.
      var focusSel = null, focusId = null, ae = document.activeElement;
      if (ae && root.contains(ae)) {
        for (var i = 0; i < FOCUS_KEYS.length; i++) {
          if (ae.hasAttribute(FOCUS_KEYS[i])) { focusSel = "[" + FOCUS_KEYS[i] + '="' + ae.getAttribute(FOCUS_KEYS[i]) + '"]'; break; }
        }
        if (!focusSel && ae.id) focusId = ae.id;
      }
      renderSteps();
      var body = ref("body");
      var s = st.step;
      body.setAttribute("data-step", s);
      body.innerHTML = s === "address" ? bodyAddress() : s === "draw" ? bodyDraw() : s === "quote" ? bodyQuote() : bodyDetails();
      renderActions();
      root.classList.toggle("is-drawing", s === "draw");
      if (s === "draw") updateDrawMeter();
      if (s === "address") wireAddress();
      var refocus = focusSel ? root.querySelector(focusSel) : focusId ? document.getElementById(focusId) : null;
      if (refocus && root.contains(refocus)) refocus.focus({ preventScroll: true });
    }

    /* ----- address search ----- */

    function wireAddress() {
      var input = document.getElementById(id + "-addr");
      var list = document.getElementById(id + "-sugg");
      var timer = null, seq = 0, results = [];

      function closeList() { list.innerHTML = ""; input.setAttribute("aria-expanded", "false"); }
      function message(text) { list.innerHTML = '<li class="tq-sugg-empty">' + esc(text) + "</li>"; input.setAttribute("aria-expanded", "false"); }

      input.addEventListener("input", function () {
        st.addrDraft = input.value;
        clearTimeout(timer);
        var q = input.value.trim();
        if (q.length < 4) { seq++; results = []; closeList(); return; }
        timer = setTimeout(function () {
          var mine = ++seq;
          geocode(q).then(function (items) {
            if (mine !== seq) return;
            results = items;
            if (!items.length) { message("No match yet. Keep typing your street address."); return; }
            list.innerHTML = items.map(function (it, i) {
              return '<li role="presentation"><button type="button" role="option" data-pick="' + i + '">' + esc(it.label) + "</button></li>";
            }).join("");
            input.setAttribute("aria-expanded", "true");
          }).catch(function () {
            if (mine !== seq) return;
            results = [];
            message("Address search isn't responding. Try the example home below.");
          });
        }, 250);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
          var first = list.querySelector("[data-pick]");
          if (first) { e.preventDefault(); first.focus(); }
        } else if (e.key === "Enter") {
          if (results.length) { e.preventDefault(); pickAddress(results[0]); }
        } else if (e.key === "Escape") {
          closeList();
        }
      });
      list.addEventListener("keydown", function (e) {
        var b = e.target.closest("[data-pick]");
        if (!b) return;
        var all = Array.prototype.slice.call(list.querySelectorAll("[data-pick]"));
        var i = all.indexOf(b);
        if (e.key === "ArrowDown" && all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); (all[i - 1] || input).focus(); }
        else if (e.key === "Escape") { closeList(); input.focus(); }
      });
      list.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pick]");
        if (!b) return;
        var item = results[+b.getAttribute("data-pick")];
        if (item) pickAddress(item);
      });
    }

    /* ----- leads ----- */

    function validateContact() {
      var c = st.contact, e = {};
      if (!c.first.trim()) e.first = "Enter your first name.";
      if (!c.last.trim()) e.last = "Enter your last name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = "Enter an email like name@example.com.";
      var digits = c.phone.replace(/\D/g, "");
      if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
      if (digits.length !== 10) e.phone = "Enter a 10-digit mobile number.";
      st.errors = e;
      return !Object.keys(e).length;
    }
    function readContact() {
      if (st.step !== "details" || st.submitted) return;
      ["first", "last", "email", "phone"].forEach(function (k) {
        var el = document.getElementById(id + "-" + k);
        if (el) st.contact[k] = el.value;
      });
      var cb = document.getElementById(id + "-consent");
      if (cb) st.contact.consent = cb.checked;
    }
    function formatPhone(p) {
      var d = String(p).replace(/\D/g, "");
      if (d.length === 11 && d[0] === "1") d = d.slice(1);
      return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : p;
    }

    function buildLead() {
      var q = quoteFor(st.material);
      return {
        id: "live-" + Date.now(),
        live: true,
        createdAt: Date.now(),
        name: (st.contact.first.trim() + " " + st.contact.last.trim()).trim(),
        firstName: st.contact.first.trim(),
        lastName: st.contact.last.trim(),
        phone: formatPhone(st.contact.phone),
        email: st.contact.email.trim(),
        consent: st.contact.consent,
        timing: st.timing,
        wants: st.intent === "measure" ? "Free measure" : "Detailed quote",
        address: st.address ? st.address.label : "Example home (demo)",
        center: st.address ? st.address.center : null,
        mode: surface.kind,
        runs: copy(st.runs),
        gates: copy(st.gates),
        drawnFt: Math.round(drawnFt()),
        material: st.material,
        height: q.height,
        color: colorFor(st.material),
        removal: st.removal,
        quote: { lo: q.lo, hi: q.hi },
        monthly: monthlyPayment(q.lo),
        fenceFt: q.fenceFt,
        visit: null,
        status: "new"
      };
    }
    function publishLead() {
      saveLead(st.lead);
      if (opts.onLead) opts.onLead(st.lead);
    }
    function bookVisit() {
      st.visitRequested = true;
      if (!st.lead) return;
      st.lead.visit = dayLabel(nextVisitDays()[st.visitDay]) + ", " + st.visitTime.toLowerCase();
      st.lead.status = "booked";
    }

    /* ----- events ----- */

    root.addEventListener("click", function (e) {
      var t = e.target.closest("button, a");
      if (!t || !root.contains(t)) return;
      var act = t.getAttribute("data-act");
      if (t.hasAttribute("data-tool")) { st.tool = t.getAttribute("data-tool"); render(); redraw(); return; }
      if (t.hasAttribute("data-gate")) { st.gateType = t.getAttribute("data-gate"); render(); return; }
      if (t.hasAttribute("data-pick-mat")) { st.material = t.getAttribute("data-pick-mat"); render(); return; }
      if (t.hasAttribute("data-height")) { st.heightBy[st.material] = t.getAttribute("data-height"); render(); return; }
      if (t.hasAttribute("data-color")) { st.colorBy[st.material] = t.getAttribute("data-color"); render(); return; }
      if (t.hasAttribute("data-timing")) { readContact(); st.timing = st.timing === t.getAttribute("data-timing") ? "" : t.getAttribute("data-timing"); render(); return; }
      if (t.hasAttribute("data-day")) { readContact(); st.visitDay = +t.getAttribute("data-day"); render(); return; }
      if (t.hasAttribute("data-time")) { readContact(); st.visitTime = t.getAttribute("data-time"); render(); return; }
      if (!act) return;
      if (act === "undo") undo();
      else if (act === "newline") newLine();
      else if (act === "clear") clearAll();
      else if (act === "use-sample") useExample();
      else if (act === "change-address") go("address");
      else if (act === "edit-drawing") go("draw");
      else if (act === "next") { if (st.active != null) newLine(); go("quote"); }
      else if (act === "detail") { st.intent = t.getAttribute("data-intent") || "quote"; go("details"); }
      else if (act === "back") { readContact(); go("quote"); }
      else if (act === "finance") toast("On a live site, this opens the contractor's financing application.");
      else if (act === "submit") {
        readContact();
        if (!validateContact()) { render(); var bad = root.querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
        st.submitted = true;
        st.lead = buildLead();
        if (st.intent === "measure") bookVisit();
        publishLead();
        render();
        bringIntoView(root.querySelector(".tq-panel"));
      } else if (act === "visit") {
        bookVisit();
        if (st.lead) publishLead();
        render();
      } else if (act === "restart") {
        st.contact = { first: "", last: "", email: "", phone: "", consent: false };
        st.timing = ""; st.submitted = false; st.intent = "quote"; st.visitRequested = false; st.lead = null; st.tool = "draw";
        if (surface.kind === "map") { clearAll(); go("address"); }
        else { loadLayout(LAYOUTS.backyard); go(live ? "address" : "draw"); }
      }
    });

    root.addEventListener("change", function (e) {
      if (e.target.id === id + "-removal") { st.removal = e.target.checked; render(); }
    });
    root.addEventListener("input", function (e) {
      if (e.target.id && e.target.id.indexOf(id + "-") === 0 && st.step === "details") readContact();
    });

    /* ----- start: the example home, with the address search first when live ----- */

    setSurface("sample");
    loadLayout(LAYOUTS.backyard);
    render();
    requestAnimationFrame(redraw);

    return { getState: function () { return st; } };
  }

  var api = {
    mount: mount,
    live: LIVE,
    priceFor: priceFor,
    materialById: materialById,
    styleLabel: styleLabel,
    gateSummary: gateSummary,
    money: money,
    moneyRange: moneyRange,
    ftLabel: ftLabel,
    esc: esc,
    fenceArt: fenceArt,
    colorHex: colorHex,
    monthlyPayment: monthlyPayment,
    snapshotMarkup: snapshotMarkup,
    renderLeadMap: renderLeadMap,
    layouts: LAYOUTS,
    lengthOf: function (runs) { return totalLength(runs, planeFt); },
    loadLead: loadLead,
    saveLead: saveLead,
    lastLead: null
  };
  window.TraceQuote = api;
})();
