/*
  TraceQuote contractor view (demo).
  Shows what a fence company receives: the lead inbox, the drawn layout,
  the specs and price the homeowner saw, and the follow-up sequence.
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
        createdAt: now - 4 * MIN, status: "new", visit: null }),
      sampleLead({ id: "s1", name: "Daniel Ruiz", phone: "(305) 555-0188", email: "", consent: true,
        address: "Sample home, Miami, FL", layout: L.frontYard, material: "aluminum", height: "4", color: "Black", timing: "In 1 to 3 months", wants: "Free measure", removal: false,
        createdAt: now - 26 * HR, status: "booked", visit: "Thu, morning" }),
      sampleLead({ id: "s2", name: "Keisha Moore", phone: "(305) 555-0164", email: "keisha@example.com", consent: true,
        address: "Sample home, Miami, FL", layout: L.leftAndBack, material: "wood", height: "6", color: "Cedar stain", timing: "Just planning", wants: "Detailed quote", removal: true,
        createdAt: now - 3 * DAY - 2 * HR, status: "following", visit: null }),
      sampleLead({ id: "s3", name: "Luis Pérez", phone: "(305) 555-0139", email: "luis@example.com", consent: false,
        address: "Sample home, Miami, FL", layout: L.backyard, material: "vinyl", height: "6", color: "Tan", timing: "As soon as possible", wants: "Free measure", removal: true,
        createdAt: now - 6 * DAY, status: "won", visit: "Mon, afternoon", won: 7400 })
    ];
  }

  var STATUS = {
    "new": { label: "New", cls: "new" },
    booked: { label: "Visit booked", cls: "booked" },
    following: { label: "Following up", cls: "following" },
    won: { label: "Won", cls: "won" }
  };

  function ago(ts) {
    var d = Date.now() - ts;
    if (d < MIN) return "just now";
    if (d < HR) return Math.round(d / MIN) + " min ago";
    if (d < DAY) return Math.round(d / HR) + " hr ago";
    var n = Math.round(d / DAY);
    return n + (n === 1 ? " day ago" : " days ago");
  }
  function clock(ts) { return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
  function firstName(n) { return String(n || "").trim().split(/\s+/)[0] || "there"; }
  function sentence(s) { return /[.!?]$/.test(s) ? s : s + "."; }

  function sequence(lead) {
    var first = firstName(lead.name);
    var est = TQ.moneyRange(lead.quote.lo, lead.quote.hi);
    var style = TQ.styleLabel(lead.material, lead.height);
    var items = [];
    items.push({ at: 0, when: "Right away", ch: "Alert to you", msg: "New quote: " + lead.name + ", " + lead.fenceFt + " ft of " + style + ", " + est + ". " + lead.phone });
    if (lead.consent) {
      items.push({ at: 0, when: "Right away", ch: "Text to " + first, msg: "Hi " + first + ", it's " + sentence(COMPANY) + " Your estimate for " + lead.fenceFt + " ft of " + style + " is " + est + ". Want us to come measure? Reply with a day that works. Reply STOP to opt out." });
    }
    if (lead.email) {
      items.push({ at: HR, when: "Within 1 hour", ch: "Email to " + first, msg: "Your fence estimate from " + COMPANY + ", with the layout you drew and how the price adds up." });
    }
    if (lead.consent) {
      items.push({ at: DAY, when: "Day 1", ch: "Text to " + first, msg: "Hi " + first + ", any questions about your fence estimate? We have measure times open this week. Reply STOP to opt out." });
      items.push({ at: 3 * DAY, when: "Day 3", ch: "Text to " + first, msg: "Still planning your fence, " + first + "? Reply with a day and we'll come take measurements. Reply STOP to opt out." });
    } else {
      items.push({ at: DAY, when: "Day 1", ch: "Reminder to you", msg: "Call " + first + " at " + lead.phone + ". No text consent, so follow-up is by phone" + (lead.email ? " and email." : ".") });
    }
    items.push({ at: 7 * DAY, when: "Day 7", ch: lead.email ? "Email to " + first : "Reminder to you", msg: lead.email ? "Last check-in on your fence estimate, with a link to book a measure." : "Last reminder to call " + first + "." });

    var elapsed = Date.now() - lead.createdAt;
    var stopped = lead.status === "booked" || lead.status === "won";
    items.forEach(function (it) {
      if (it.at === 0 || (!stopped && elapsed >= it.at)) it.state = "sent";
      else if (stopped) it.state = "stopped";
      else it.state = "scheduled";
    });
    return items;
  }

  function mount(root) {
    var state = { leads: [], selected: null, overrides: {} };
    var leadMap = null, leadMapKey = "";

    function load() {
      var live = TQ.loadLead();
      var list = samples();
      list.forEach(function (l) {
        var o = state.overrides[l.id];
        if (o) { l.status = o.status; if (o.won) l.won = o.won; }
      });
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

    function pill(status) {
      var s = STATUS[status] || STATUS["new"];
      return '<span class="tqc-pill tqc-pill--' + s.cls + '">' + s.label + "</span>";
    }

    function renderList() {
      return state.leads.map(function (l) {
        var on = l.id === state.selected;
        return '<li><button type="button" class="tqc-item' + (on ? " is-on" : "") + '" data-lead="' + esc(l.id) + '"' + (on ? ' aria-current="true"' : "") + ">" +
          '<span class="tqc-item-top"><b>' + esc(l.name) + "</b>" + (l.live ? '<span class="tqc-you">Your test</span>' : "") + '<span class="tqc-time">' + ago(l.createdAt) + "</span></span>" +
          '<span class="tqc-item-mid">' + TQ.ftLabel(l.drawnFt) + " · " + esc(TQ.styleLabel(l.material, l.height)) + "</span>" +
          '<span class="tqc-item-bot">' + pill(l.status) + '<span class="tqc-amt">' + TQ.moneyRange(l.quote.lo, l.quote.hi) + "</span></span>" +
          "</button></li>";
      }).join("");
    }

    function renderStats() {
      var leads = state.leads.length;
      var booked = state.leads.filter(function (l) { return l.status === "booked" || l.status === "won"; }).length;
      var won = state.leads.filter(function (l) { return l.status === "won"; }).length;
      return '<div class="tqc-stat"><span class="tqc-stat-n">' + leads + '</span><span class="tqc-stat-k">Leads</span></div>' +
        '<div class="tqc-stat"><span class="tqc-stat-n">' + booked + '</span><span class="tqc-stat-k">Visits booked</span></div>' +
        '<div class="tqc-stat"><span class="tqc-stat-n">' + won + '</span><span class="tqc-stat-k">Won</span></div>';
    }

    function renderDetail(l) {
      var gates = TQ.gateSummary(l.gates);
      var seq = sequence(l).map(function (it) {
        var label = it.state === "sent" ? "Sent" : it.state === "stopped" ? "Stopped" : "Scheduled";
        return '<li class="tqc-step tqc-step--' + it.state + '">' +
          '<div class="tqc-step-when"><b>' + esc(it.when) + "</b><span>" + esc(it.ch) + "</span></div>" +
          '<p class="tqc-step-msg">' + esc(it.msg) + "</p>" +
          '<span class="tqc-step-state">' + label + "</span></li>";
      }).join("");
      var won = l.status === "won" && l.won ? '<div><dt>Sold for</dt><dd>' + TQ.money(l.won) + "</dd></div>" : "";
      return '<div class="tqc-head">' +
        '<div class="tqc-head-text"><h3 class="tqc-name">' + esc(l.name) + "</h3>" +
        '<p class="tqc-meta">' + esc(l.wants || "Detailed quote") + " requested " + ago(l.createdAt) + " on your website" + (l.sample ? " · sample lead" : "") + "</p></div>" +
        pill(l.status) + "</div>" +
        '<figure class="tqc-map"><div class="tqc-map-art"></div><figcaption>' + TQ.ftLabel(l.drawnFt) + " drawn" + (gates ? " · " + gates : "") +
        (l.mode === "map" ? " · traced on satellite imagery" : "") + "</figcaption></figure>" +
        '<dl class="tqc-specs">' +
        "<div><dt>Fence</dt><dd>" + TQ.ftLabel(l.fenceFt) + " of " + esc(TQ.styleLabel(l.material, l.height)) + (l.color ? ", " + esc(l.color.toLowerCase()) : "") + "</dd></div>" +
        "<div><dt>Gates</dt><dd>" + (gates || "None") + "</dd></div>" +
        "<div><dt>Old fence</dt><dd>" + (l.removal ? "Remove " + TQ.ftLabel(l.drawnFt) : "Keep or none") + "</dd></div>" +
        "<div><dt>Price shown</dt><dd>" + TQ.moneyRange(l.quote.lo, l.quote.hi) + "</dd></div>" +
        "<div><dt>Payment shown</dt><dd>" + (l.monthly ? "From " + TQ.money(l.monthly) + "/mo" : "Not shown") + "</dd></div>" +
        "<div><dt>Install timing</dt><dd>" + (l.timing ? esc(l.timing) : "Not given") + "</dd></div>" +
        "<div><dt>Asked for</dt><dd>" + esc(l.wants || "Detailed quote") + "</dd></div>" +
        "<div><dt>Measure visit</dt><dd>" + (l.visit ? esc(l.visit) : "Not booked yet") + "</dd></div>" +
        won +
        "</dl>" +
        '<div class="tqc-contact">' +
        '<div><span class="tqc-k">Phone</span><span class="tqc-v">' + esc(l.phone) + "</span></div>" +
        '<div><span class="tqc-k">Email</span><span class="tqc-v">' + (l.email ? esc(l.email) : "Not given") + "</span></div>" +
        '<div><span class="tqc-k">Address</span><span class="tqc-v">' + esc(l.address) + "</span></div>" +
        '<div><span class="tqc-k">Texts</span><span class="tqc-v">' + (l.consent ? "Agreed at " + clock(l.createdAt) : "Did not agree, so no texts") + "</span></div>" +
        "</div>" +
        '<div class="tqc-actions">' +
        (l.status !== "booked" && l.status !== "won" ? '<button type="button" class="tq-btn" data-set="booked">Mark visit booked</button>' : "") +
        (l.status !== "won" ? '<button type="button" class="tq-btn tq-btn--ghost" data-set="won">Mark job won</button>' : "") +
        "</div>" +
        '<section class="tqc-follow" aria-label="Follow-up">' +
        '<h4 class="tqc-sub">Follow-up for this lead</h4>' +
        '<p class="tqc-note">Example sequence. It stops when the homeowner books a visit, replies, or texts STOP.</p>' +
        '<ol class="tqc-timeline">' + seq + "</ol></section>";
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
        '<aside class="tqc-inbox" aria-label="Leads">' +
        '<div class="tqc-inbox-head"><h2 class="tqc-title">Leads</h2><span class="tqc-tag">' + esc(COMPANY) + "</span></div>" +
        '<div class="tqc-stats">' + renderStats() + "</div>" +
        '<ul class="tqc-list">' + renderList() + "</ul>" +
        '<p class="tqc-note">Sample leads are made up for this demo. A lead you create on the quote page shows up here as “Your test.”</p>' +
        "</aside>" +
        '<section class="tqc-detail" aria-live="polite">' + renderDetail(l) + "</section>" +
        "</div>";
      var slot = root.querySelector(".tqc-map-art");
      if (keepNode) slot.parentNode.replaceChild(keepNode, slot);
      else { leadMap = TQ.renderLeadMap(slot, l); leadMapKey = key; }
    }

    root.addEventListener("click", function (e) {
      var item = e.target.closest("[data-lead]");
      if (item) { state.selected = item.getAttribute("data-lead"); render(); return; }
      var set = e.target.closest("[data-set]");
      if (set) {
        var l = current();
        l.status = set.getAttribute("data-set");
        if (l.status === "won" && !l.won) l.won = Math.round((l.quote.lo + l.quote.hi) / 2 / 50) * 50;
        if (l.live) TQ.saveLead(l);
        else { state.overrides[l.id] = { status: l.status, won: l.won }; render(); }
      }
    });

    document.addEventListener("tq:lead", function () { state.justArrived = true; render(); });
    render();
    return { refresh: render };
  }

  window.TraceQuoteContractor = { mount: mount };
})();
