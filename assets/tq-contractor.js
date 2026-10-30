/*
  TraceQuote contractor view (demo).
  Shows what a fence company receives today: an email for every request, with a subject line that says who, where
  and what, the details the homeowner entered, and the fence as they traced it. The list on the left stands in for
  the owner's own email inbox. Nothing here promises features the service doesn't have (no dashboard, no statuses,
  no automatic follow-up).
*/
(function () {
  "use strict";

  var TQ = window.TraceQuote;
  var CFG = window.TQ_CONFIG || {};
  var COMPANY = (CFG.demoCompany && CFG.demoCompany.name) || "Your Fence Co.";
  var esc = TQ.esc;
  var MIN = 60000, HR = 60 * MIN, DAY = 24 * HR;

  function sampleLead(o) {
    var drawn = TQ.lengthOf(o.layout.runs);
    var q = TQ.priceFor(drawn, o.layout.gates, { material: o.material, height: o.height, removal: o.removal });
    var lead = {
      mode: "sample", sample: true,
      runs: o.layout.runs, gates: o.layout.gates,
      drawnFt: Math.round(drawn), fenceFt: q.fenceFt, height: q.height,
      quote: { lo: q.lo, hi: q.hi },
      monthly: TQ.monthlyPayment(q.lo)
    };
    Object.keys(o).forEach(function (k) { if (k !== "layout") lead[k] = o[k]; });
    return lead;
  }

  function samples() {
    var now = Date.now(), L = TQ.layouts;
    return [
      sampleLead({ id: "s0", name: "Maria Gómez", phone: "(305) 555-0117", email: "maria@example.com", consent: true,
        address: "Sample home, Miami, FL", layout: L.backyard, material: "vinyl", height: "6", color: "White", timing: "As soon as possible", wants: "Detailed quote", removal: false,
        createdAt: now - 4 * MIN, visit: null }),
      sampleLead({ id: "s1", name: "Daniel Ruiz", phone: "(305) 555-0188", email: "", consent: true,
        address: "Sample home, Miami, FL", layout: L.frontYard, material: "aluminum", height: "4", color: "Black", timing: "In 1 to 3 months", wants: "Free measure", removal: false,
        createdAt: now - 26 * HR, visit: "Thu, morning" }),
      sampleLead({ id: "s2", name: "Keisha Moore", phone: "(305) 555-0164", email: "keisha@example.com", consent: true,
        address: "Sample home, Miami, FL", layout: L.leftAndBack, material: "wood", height: "6", color: "Cedar stain", timing: "Just planning", wants: "Detailed quote", removal: true,
        createdAt: now - 3 * DAY - 2 * HR, visit: null }),
      sampleLead({ id: "s3", name: "Luis Pérez", phone: "(305) 555-0139", email: "luis@example.com", consent: false,
        address: "Sample home, Miami, FL", layout: L.backyard, material: "vinyl", height: "6", color: "Tan", timing: "As soon as possible", wants: "Free measure", removal: true,
        createdAt: now - 6 * DAY, visit: "Mon, afternoon" })
    ];
  }

  function ago(ts) {
    var d = Date.now() - ts;
    if (d < MIN) return "just now";
    if (d < HR) return Math.round(d / MIN) + " min ago";
    if (d < DAY) return Math.round(d / HR) + " hr ago";
    var n = Math.round(d / DAY);
    return n + (n === 1 ? " day ago" : " days ago");
  }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0] || "the homeowner"; }

  // Same wording as the subject line on real request emails (see leadSubject in tq-widget.js).
  function subjectOf(l) {
    var where = String(l.address || "").split(",").slice(0, 2).join(",").trim();
    var who = (l.name || "Homeowner") + (where ? ", " + where : "");
    var s = l.wants === "Free measure"
      ? "Free measure request: " + who + (l.visit ? " — " + l.visit : "")
      : "Quote request: " + who + " — " + TQ.ftLabel(l.fenceFt) + " of " + TQ.styleLabel(l.material, l.height) + ", " + TQ.moneyRange(l.quote.lo, l.quote.hi);
    return s.length > 160 ? s.slice(0, 157) + "…" : s;
  }

  function directions(l) {
    var addr = String(l.address || "");
    if (!addr || /example home/i.test(addr)) return "Not given";
    return '<a href="https://www.google.com/maps/search/?api=1&amp;query=' + esc(encodeURIComponent(addr)) + '" target="_blank" rel="noopener">Open in Google Maps</a>';
  }

  // The fields a real request email carries, in the same order.
  function rows(l) {
    var gates = TQ.gateSummary(l.gates);
    var r = [
      ["Asked for", esc(l.wants || "Detailed quote")],
      ["Name", esc(l.name)],
      ["Phone", esc(l.phone)],
      ["Email", l.email ? esc(l.email) : "Not given"],
      ["Address", esc(l.address)],
      ["Fence", TQ.ftLabel(l.fenceFt) + " of " + esc(TQ.styleLabel(l.material, l.height)) + (l.color ? ", " + esc(String(l.color).toLowerCase()) : "") +
        (l.mode === "manual" ? " (length typed in by the homeowner, not traced)" : "")],
      ["Gates", gates || "None"],
      ["Old fence removal", l.removal ? "Yes" : "No"],
      ["Price shown", TQ.moneyRange(l.quote.lo, l.quote.hi)],
      ["Monthly shown", l.monthly ? "From " + TQ.money(l.monthly) + "/mo" : "Not shown"],
      ["Install timing", l.timing ? esc(l.timing) : "Not given"]
    ];
    if (l.visit) r.push(["Measure visit", esc(l.visit)]);
    r.push(["Texts OK", l.consent ? "Yes" : "No"]);
    r.push(["Directions", directions(l)]);
    return r;
  }

  function mount(root) {
    var state = { leads: [], selected: null };
    var leadMap = null, leadMapKey = "";

    function load() {
      var live = TQ.loadLead();
      var list = samples();
      if (live) {
        list = list.filter(function (l) { return l.id !== "s0"; });
        list.unshift(live);
      }
      state.leads = list;
      if (!state.selected || !list.some(function (l) { return l.id === state.selected; })) state.selected = list[0].id;
      if (live && state.justArrived) { state.selected = live.id; state.justArrived = false; }
    }

    function current() {
      for (var i = 0; i < state.leads.length; i++) if (state.leads[i].id === state.selected) return state.leads[i];
      return state.leads[0];
    }

    function renderList() {
      return state.leads.map(function (l) {
        var on = l.id === state.selected;
        return '<li><button type="button" class="tqc-item' + (on ? " is-on" : "") + '" data-lead="' + esc(l.id) + '"' + (on ? ' aria-current="true"' : "") + ">" +
          '<span class="tqc-item-top"><b>' + esc(l.name || "Homeowner") + "</b>" + (l.live ? '<span class="tqc-you">Your test</span>' : "") +
          '<span class="tqc-time">' + ago(l.createdAt) + "</span></span>" +
          '<span class="tqc-item-subject">' + esc(subjectOf(l)) + "</span>" +
          "</button></li>";
      }).join("");
    }

    function renderMail(l) {
      var dl = rows(l).map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
      // Typed-in lengths have no tracing, so their emails have no satellite picture either.
      var pic = l.mode === "manual"
        ? '<p class="tqc-note tqc-mail-nopic">No satellite picture: the homeowner typed in the length instead of tracing it.</p>'
        : '<figure class="tqc-map"><div class="tqc-map-art"></div><figcaption>What the satellite picture link shows: the fence as ' +
          esc(firstName(l.name)) + " traced it.</figcaption></figure>";
      return '<div class="tqc-mail-top"><span>' + (l.sample ? "Sample request" : "Your test request") + "</span>" +
        '<span class="tqc-time">' + ago(l.createdAt) + "</span></div>" +
        '<h3 class="tqc-mail-subject">' + esc(subjectOf(l)) + "</h3>" +
        '<p class="tqc-mail-to">To: ' + esc(COMPANY) + "</p>" +
        '<div class="tqc-mail-body">' +
        '<dl class="tqc-rows">' + dl + "</dl>" +
        pic +
        "</div>" +
        '<p class="tqc-mail-reply">Reply to this email and you’re writing to ' + esc(firstName(l.name)) + ".</p>";
    }

    function render() {
      load();
      var l = current();
      // Keep the lead's map when the same drawing is still on screen, so it isn't reloaded on every click.
      var key = l.id + ":" + JSON.stringify(l.runs) + ":" + JSON.stringify(l.gates);
      var keepNode = key === leadMapKey ? root.querySelector(".tqc-map-art") : null;
      if (!keepNode && leadMap) { leadMap.destroy(); leadMap = null; }
      root.innerHTML =
        '<div class="tqc">' +
        '<aside class="tqc-inbox" aria-label="Requests in your inbox">' +
        '<div class="tqc-inbox-head"><h2 class="tqc-title">Inbox</h2><span class="tqc-tag">' + esc(COMPANY) + "</span></div>" +
        '<ul class="tqc-list">' + renderList() + "</ul>" +
        '<p class="tqc-note">Each request is an email to the address you choose. These samples are made up; one you send from the quote page shows up here as “Your test.”</p>' +
        "</aside>" +
        '<section class="tqc-detail tqc-mail" aria-live="polite">' + renderMail(l) + "</section>" +
        "</div>";
      var slot = root.querySelector(".tqc-map-art");
      if (!slot) { leadMapKey = ""; return; }
      if (keepNode) slot.parentNode.replaceChild(keepNode, slot);
      else { leadMap = TQ.renderLeadMap(slot, l); leadMapKey = key; }
    }

    root.addEventListener("click", function (e) {
      var item = e.target.closest("[data-lead]");
      if (item) { state.selected = item.getAttribute("data-lead"); render(); }
    });

    document.addEventListener("tq:lead", function () { state.justArrived = true; render(); });
    render();
    return { refresh: render };
  }

  window.TraceQuoteContractor = { mount: mount };
})();
