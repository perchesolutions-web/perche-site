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
            "One-click text message follow-ups",
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
