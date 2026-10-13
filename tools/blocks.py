"""Reusable homepage/pricing blocks: FSM comparison, flag logic, guarantee, founder, pricing."""
from layout import *
import layout


def founder_block(small=False):
    f = layout.FOUNDER
    if not (f.get("name") and f.get("photo")):
        return ""  # nothing placeholder ever renders
    bio = layout.FOUNDER_BIO
    if small:
        bio = bio.split(". ")[0] + "."
    return (f'<section><div class="wrap"><div class="founder"><img src="{f["photo"]}" alt="{f["name"]}" width="96" height="96">'
            f'<div><div class="founder-name">{f["name"]}</div><div class="founder-title">{f["title"]}</div><p>{bio}</p></div></div></div></section>\n')


def compare_fsm_section():
    fsm = [
        ("How items are ordered", "Usually by date or by the order records were created."),
        ("What a reminder says", "The same wording for every customer, on a schedule you set."),
        ("What it looks at", "Its own records, one list at a time."),
        ("What it tells you today", "That a reminder is due."),
        ("How it measures success", "Whether a reminder was sent."),
    ]
    us = [
        ("How items are ordered", "By dollar value, how cold it is, and the customer's lifetime value."),
        ("What a message says", "Wording that fits the situation: a quote, an invoice, how overdue it is."),
        ("What it looks at", "Quotes, invoices, past customers, leads and reviews in one ranked list."),
        ("What it tells you today", "Which $4,200 quote to call first, and why."),
        ("How it measures success", "Whether money came back, with identified, expected and recovered kept separate."),
    ]
    col = lambda title, rows, cls="": (f'<div class="vs-col {cls}"><h3>{title}</h3><ul>' +
                                       "".join(f"<li><strong>{a}</strong>{b}</li>" for a, b in rows) + "</ul></div>")
    body = ('<div class="vs-grid">' + col("Your field service software's reminders", fsm) + col("Perch&eacute;", us, "vs-us") + "</div>"
            '<p class="vs-note">Field service software is great at running the job. This describes how reminder tools in that software typically work; exact features vary by product and plan. Perch&eacute; sits on top of it and doesn&rsquo;t replace it.</p>')
    return section("Doesn't Jobber already do this?",
                   "Your field service software can remind you. It treats every quote and invoice the same. Perch&eacute; works out which ones are worth your time first.",
                   body, band=True, center=True, id_="vs-fsm")


def flag_logic_section():
    rows = [
        ("Cold estimate", "An estimate that was sent and is still open <strong>14 or more days</strong> later.", "14 days"),
        ("Unpaid invoice", "An invoice that is <strong>14 or more days past due</strong>. Customers with a history of paying late are marked lower-likelihood.", "14 days"),
        ("Lapsed customer", "A customer who has had maintenance visits before and has had <strong>no visit in 12 months</strong>.", "12 months"),
        ("Cold lead", "A new inquiry with no first reply, or one that has had no update for <strong>3 days</strong>.", "3 days"),
        ("Expiring maintenance plan", "A plan <strong>due for renewal within 45 days</strong> or already past its renewal date.", "45 days"),
    ]
    html = ('<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Flag</th><th>When we raise it</th><th>Default</th></tr></thead><tbody>' +
            "".join(f"<tr><th>{a}</th><td>{b}</td><td>{c}</td></tr>" for a, b, c in rows) + "</tbody></table></div>"
            '<div style="max-width:760px;margin:28px auto 0;text-align:left;">' + prose(
                "<p><strong>You can change the timing.</strong> The cold estimate, unpaid invoice and lapsed customer windows are adjustable in Settings, so a shop that closes quotes in three days can set its own clock.</p>",
                "<p><strong>Then we rank.</strong> Within each flag, items are ordered by dollar value, how long they have been cold, and what the customer has been worth to you over time. Every flag explains itself in plain English with your real dates and amounts.</p>",
                "<p><strong>No black box.</strong> These are plain rules, not a mystery score. If you disagree with a flag, you can see exactly why it was raised.</p>") + "</div>")
    return section("How we decide what to flag", "The actual rules, in plain English. These are the defaults every account starts with.", html, center=True, id_="flag-logic")


def guarantee_block(link_to="/pricing/#guarantee-terms"):
    return ('<section><div class="wrap"><div class="guarantee" id="guarantee"><h2>The Payback Guarantee</h2>'
            "<p>Recover at least your subscription cost within 90 days, or we refund every dollar you paid. One condition: you send the follow-ups Perch&eacute; writes for you.</p>"
            f'<p style="font-size:13px;color:var(--muted2);">Applies to the Professional plan.</p><a href="{link_to}">How recovery is measured &rarr;</a></div></div></section>\n')


GUARANTEE_FAQ = ("How does the Payback Guarantee work, and how is recovery measured?",
    '<span id="guarantee-terms"></span>During your first 90 days on the Professional plan, Perch&eacute; tracks recovered revenue in your dashboard (the ROI report). '
    "Revenue counts as recovered when an estimate that was flagged is later won, or an invoice that was flagged is later paid, <strong>after you sent a follow-up from Perch&eacute;</strong>. "
    "Wins that happen with no follow-up from Perch&eacute; are not counted. If that total is less than what you paid us over those 90 days, contact us and we will refund every dollar you paid. "
    "The condition is that you send the follow-ups Perch&eacute; writes for the items it flags. The same numbers you see in the dashboard decide the guarantee.")


def _li(items):
    return "".join(f'<li><span class="check">&#10003;</span>{i}</li>' for i in items)


def pricing_cards():
    starter = (
        '<div class="card card-hover pricing-card"><div class="pricing-name">Starter</div><div class="pricing-price">$299<span>/mo</span></div>'
        '<div class="pricing-blurb">For owner-operators and small crews who want to see what&rsquo;s slipping and follow up by email.</div>'
        f'<a class="btn btn-primary" href="{APP}/signup" style="display:block;text-align:center;margin:0 0 22px;">Start free trial</a>'
        '<ul class="pricing-list">' + _li([
            "Jobber, Housecall Pro, Service Fusion, Workiz, or upload your own spreadsheet",
            "Cold estimate, unpaid invoice and lapsed customer flags, ranked by dollars",
            "Cold-lead and review inboxes, with suggested replies",
            "Configurable flag thresholds",
            "One-click email follow-ups",
            "Recovered-revenue tracking and live ROI on your subscription",
            "Weekly summary email"]) + "</ul></div>")
    pro = (
        '<div class="card card-hover pricing-card" style="border:2px solid var(--accent);box-shadow:0 14px 32px var(--accent-glow);">'
        '<span class="pricing-badge">MOST POPULAR</span><div class="pricing-name">Professional</div><div class="pricing-price">$599<span>/mo</span></div>'
        '<div class="pricing-blurb">The full recovery system: the product, hands-on setup, and a guarantee behind it.</div>'
        f'<a class="btn btn-primary" href="{APP}/signup" style="display:block;text-align:center;margin:0 0 22px;">Start free trial</a>'
        '<div class="stack">'
        '<div class="stack-item"><h4>Revenue Recovery Engine</h4><p>The product, with everything in Starter plus:</p><ul>' + "".join(f"<li>{x}</li>" for x in [
            "Automatic, escalating follow-up emails (up to 3 touches)",
            "One-tap text follow-ups from your own phone",
            "Slack alerts and a daily summary email",
            "Expected-recovery estimate and lifetime-value ranking",
            "Trend, benchmark and category reports, with CSV and PDF export",
            "Maintenance-plan revenue at risk and upsell opportunities",
            "Take payment straight from an invoice reminder (Stripe Connect)"]) + "</ul></div>"
        '<div class="stack-item"><h4>First $5K Sprint</h4><p>Done-for-you setup and threshold tuning, plus a 20-minute call where we send your first batch of follow-ups together.</p></div>'
        '<div class="stack-item"><h4>Text script library</h4><p>Ready-to-send replies for the objections HVAC and plumbing customers raise. <a href="/resources/text-script-library/" style="color:var(--accent-light);">See the library</a></p></div>'
        '<div class="stack-item"><h4>Maintenance Plan Upsell Playbook</h4><p>How to price, pitch and renew plans customers keep. <a href="/resources/maintenance-plan-playbook/" style="color:var(--accent-light);">Read the playbook</a></p></div>'
        '<div class="stack-item"><h4>The Payback Guarantee</h4><p>Recover at least your subscription cost within 90 days, or we refund every dollar you paid. <a href="#guarantee-terms" style="color:var(--accent-light);">How it&rsquo;s measured</a></p></div>'
        '</div></div>')
    dfy = (
        '<div class="card card-hover pricing-card"><div class="pricing-name">Done-For-You</div><div class="pricing-price">$1,500<span>/mo</span></div>'
        '<div class="pricing-blurb">We run your follow-ups for you.</div>'
        f'<a class="btn btn-ghost" href="{CAL}" target="_blank" rel="noopener" onclick="if(window.Calendly){{Calendly.initPopupWidget({{url:\'{CAL}\'}});return false;}}" style="display:block;text-align:center;margin:0 0 22px;">Book a call</a>'
        '<ul class="pricing-list">' + _li([
            "Everything in Professional",
            "Our team reviews your flags",
            "We send and manage your follow-up outreach",
            "Set up with a call, not a self-serve signup"]) + "</ul></div>")
    return f'<div class="grid grid-3 pricing-grid">{starter}{pro}{dfy}</div>'


# ---------------- Home v2 design components ----------------
def home_hero(trial_btn, call_btn_html):
    return f"""<section class="hero2"><div class="wrap hero2-grid">
<div class="hero2-copy">
<h1 class="hero2-title">Find the <span class="accent">revenue</span> your business is missing</h1>
<p class="hero2-sub">Connect Jobber or Housecall Pro and see the dollar amount you&rsquo;re leaving on the table in under 5 minutes. Read-only, no card required.</p>
<div class="hero2-ctas">{trial_btn}{call_btn_html}</div>
<div class="hero2-trust"><span>Read-only access</span><span>No card required</span><span>Cancel any time</span></div>
<div class="hero2-works"><span class="hero2-works-label">Works with</span><span>Jobber</span><span>Housecall Pro</span><span>Service Fusion</span><span>Workiz</span><span>Spreadsheets</span></div>
</div>
<div class="hero2-visual" aria-hidden="true">
<div class="audit-card">
  <div class="audit-top"><span class="audit-label">Revenue leak audit</span><span class="audit-live"><i></i>Example</span></div>
  <div class="audit-total"><span class="audit-cur">$</span>5,030<span class="audit-cap">sitting in your pipeline right now</span></div>
  <div class="audit-bar"><span style="width:83.5%;background:var(--amber)"></span><span style="width:12.1%;background:var(--red)"></span><span style="width:4.4%;background:var(--green)"></span></div>
  <div class="audit-rows">
    <div class="audit-row"><i style="background:var(--amber)"></i><div><b>Cold estimate</b><small>Furnace replacement &middot; sent 11 days ago</small></div><em>$4,200</em></div>
    <div class="audit-row"><i style="background:var(--red)"></i><div><b>Unpaid invoice</b><small>AC tune-up + repair &middot; 27 days past due</small></div><em>$610</em></div>
    <div class="audit-row"><i style="background:var(--green)"></i><div><b>Lapsed customer</b><small>Annual maintenance &middot; 14 months</small></div><em>$220</em></div>
  </div>
  <div class="audit-foot">Illustrative example &mdash; not real customer data</div>
</div>
<div class="float-card float-a"><span class="float-dot"></span><div><b>Follow-up ready</b><small>Message drafted for the $4,200 quote</small></div></div>
<div class="float-card float-b"><b>Read-only</b><small>We never change your records</small></div>
</div></section>"""


def home_bento():
    return """<section id="solve"><div class="wrap">
<div class="sec-head"><h2 class="section-title">What Perch&eacute; does</h2><p class="section-sub">One place that shows where your money is slipping away, and what to do about it.</p></div>
<div class="bento">
<a class="bento-card bento-lg card-hover" href="/solutions/cold-estimates/">
  <span class="bento-no">01</span>
  <h3>Quotes that went quiet</h3>
  <p>Estimates that were sent and never answered, ranked by dollars and how cold they are, each with a follow-up ready to send.</p>
  <div class="bento-ui" aria-hidden="true">
    <div class="tl"><span class="tl-dot on"></span><span class="tl-line"></span><span class="tl-dot on"></span><span class="tl-line"></span><span class="tl-dot flag"></span></div>
    <div class="tl-labels"><span>Quote sent</span><span>Day 7 &middot; no reply</span><span>Day 14 &middot; flagged</span></div>
    <div class="bento-msg"><b>Suggested follow-up</b>&ldquo;Hi Dana, checking in on the furnace quote &mdash; happy to answer any questions.&rdquo;</div>
  </div>
  <span class="card-link">Learn more &rarr;</span>
</a>
<a class="bento-card card-hover" href="/solutions/unpaid-invoices/"><span class="bento-no">02</span><h3>Invoices nobody paid</h3><p>Everything past due in one list, with the right nudge for each customer.</p><span class="card-link">Learn more &rarr;</span></a>
<a class="bento-card card-hover" href="/solutions/lapsed-customers/"><span class="bento-no">03</span><h3>Customers who drifted</h3><p>Past customers due for service, with a friendly check-in ready to go.</p><span class="card-link">Learn more &rarr;</span></a>
<a class="bento-card bento-wide card-hover" href="/solutions/cold-leads/"><span class="bento-no">04</span><h3>Leads and reviews</h3><p>Inquiries nobody answered and reviews nobody replied to, in one place.</p><span class="card-link">Learn more &rarr;</span></a>
</div></div></section>
"""


def home_how(steps_list):
    items = "".join(f'<div class="how-step"><div class="how-no">{i}</div><h3>{t}</h3><p>{b}</p></div>' for i, (t, b) in enumerate(steps_list, 1))
    return f"""<section class="band" id="how-it-works"><div class="wrap">
<div class="sec-head"><h2 class="section-title">How it works</h2><p class="section-sub">Set up in minutes. No new habits to learn.</p></div>
<div class="how-grid">{items}</div></div></section>
"""


# ================= PREMIUM v3 (overrides earlier definitions) =================
_IC = {
 "quote": '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
 "invoice": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 "people": '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 010 5M18 14.5c1.8.8 3 2.5 3 5.5"/>',
 "inbox": '<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
 "check": '<path d="M5 12l4.5 4.5L19 7"/>',
}
def _ic(n, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{_IC[n]}</svg>'


def home_hero(trial_btn, call_btn_html):
    rows = [("Furnace replacement quote", "Cold estimate &middot; sent 11 days ago", "$4,200", "amber"),
            ("AC tune-up + repair", "Unpaid invoice &middot; 27 days past due", "$610", "red"),
            ("Annual maintenance", "Lapsed customer &middot; 14 months", "$220", "green"),
            ("Water heater install", "Cold estimate &middot; sent 16 days ago", "$2,900", "amber")]
    rws = "".join(f'<div class="dm-row"><i class="dm-dot dm-{c}"></i><div><b>{t}</b><small>{s}</small></div><em>{v}</em><span class="dm-btn">Follow up</span></div>' for t, s, v, c in rows)
    return f"""<section class="hero3"><div class="wrap">
<div class="hero3-copy">
<h1 class="hero3-title">Find the revenue your business is <em>missing.</em></h1>
<p class="hero3-sub">Connect Jobber or Housecall Pro and see the dollar amount you&rsquo;re leaving on the table in under 5 minutes. Read-only, no card required.</p>
<div class="hero3-ctas">{trial_btn}{call_btn_html}</div>
<div class="hero3-trust"><span>{_ic("check")}Read-only access</span><span>{_ic("check")}No card required</span><span>{_ic("check")}Cancel any time</span></div>
</div>
<div class="hero3-stage" aria-hidden="true">
<div class="dm">
  <div class="dm-bar"><i></i><i></i><i></i><span>Perch&eacute; &middot; Dashboard</span></div>
  <div class="dm-body">
    <div class="dm-head"><div><div class="dm-eyebrow">Revenue identified</div><div class="dm-big">$7,930</div></div>
      <div class="dm-pills"><div><small>Expected</small><b>$3,410</b></div><div><small>Recovered</small><b>$0</b></div></div></div>
    <div class="dm-sec">Priority opportunities</div>
    {rws}
  </div>
  <div class="dm-foot">Illustrative example &mdash; not real customer data</div>
</div>
</div>
</div>
<div class="wrap"><div class="works3"><span class="works3-l">Connects to</span><span>Jobber</span><span>Housecall Pro</span><span>Service Fusion</span><span>Workiz</span><span>Spreadsheet upload</span></div></div>
</section>"""


def home_statement():
    return """<section class="statement"><div class="wrap">
<p class="statement-text">The money is rarely lost on the job. It&rsquo;s lost in the follow-up &mdash; the quote that went quiet, the invoice nobody chased, the customer who simply drifted away.</p>
<p class="statement-sub">Perch&eacute; reads your existing software, finds those moments, ranks them by dollars, and writes the follow-up for you.</p>
</div></section>"""


def home_bento():
    def card(no, ic, t, p, href, extra="", cls=""):
        return f'<a class="bento-card {cls}" href="{href}"><div class="bento-top">{_ic(ic, "bento-ic")}<span class="bento-no">{no}</span></div><h3>{t}</h3><p>{p}</p>{extra}<span class="card-link">Learn more <b>&rarr;</b></span></a>'
    ui = """<div class="bento-ui" aria-hidden="true"><div class="tl"><span class="tl-dot on"></span><span class="tl-line"></span><span class="tl-dot on"></span><span class="tl-line"></span><span class="tl-dot flag"></span></div><div class="tl-labels"><span>Quote sent</span><span>Day 7 &middot; no reply</span><span>Day 14 &middot; flagged</span></div><div class="bento-msg"><b>Suggested follow-up</b>&ldquo;Hi Dana, checking in on the furnace quote &mdash; happy to answer any questions.&rdquo;</div></div>"""
    return f"""<section id="solve" class="sec-pad"><div class="wrap">
<div class="sec-head"><h2 class="section-title">Four places revenue <em>quietly</em> slips away</h2><p class="section-sub">One place that shows where your money is stuck, and what to do about it.</p></div>
<div class="bento">
{card("01","quote","Quotes that went quiet","Estimates that were sent and never answered, ranked by dollars and how cold they are, each with a follow-up ready to send.","/solutions/cold-estimates/",ui,"bento-lg")}
{card("02","invoice","Invoices nobody paid","Everything past due in one list, with the right nudge for each customer.","/solutions/unpaid-invoices/")}
{card("03","people","Customers who drifted","Past customers due for service, with a friendly check-in ready to go.","/solutions/lapsed-customers/")}
{card("04","inbox","Leads and reviews","Inquiries nobody answered and reviews nobody replied to, in one place.","/solutions/cold-leads/","","bento-wide")}
</div></div></section>
"""


def home_how(steps_list):
    items = "".join(f'<div class="how-step"><div class="how-no">0{i}</div><h3>{t}</h3><p>{b}</p></div>' for i, (t, b) in enumerate(steps_list, 1))
    return f"""<section class="sec-pad" id="how-it-works"><div class="wrap">
<div class="sec-head"><h2 class="section-title">Set up in minutes. <em>No new habits.</em></h2></div>
<div class="how-grid">{items}</div></div></section>
"""
