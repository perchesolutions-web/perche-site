from layout import *
import re

PAGES = []

# ---------- Guides ----------
def guide(slug, tag, title, sub, minutes, body_html, related_guides):
    path = f"/resources/{slug}/"
    body = page_hero(tag, title, sub, None, [("Home", "/"), ("Resources", "/resources/"), (tag.title(), None)])
    body += section(None, None, f'<div class="article-meta">{minutes} min read &middot; Perch&eacute; Team</div>' + body_html)
    body += section("Keep reading", None, cards(related_guides, 3), band=True)
    body += cta_band("Want this running automatically?", "Perch&eacute; watches your estimates, invoices and customers every night and writes the follow-up for you.")
    plain = re.sub(r"<[^>]+>", "", title)
    return dict(path=path, title=plain + " | Perch&eacute;", desc=sub[:155], body=body, schema="")

GUIDE_INDEX = [
    ("How to follow up on a cold estimate", "A practical cadence, with scripts you can copy.", "/resources/follow-up-on-cold-estimates/"),
    ("An invoice collection checklist", "From friendly reminder to firm phone call.", "/resources/invoice-collection-checklist/"),
    ("The maintenance plan playbook", "Pricing, pitching and renewing plans customers keep.", "/resources/maintenance-plan-playbook/"),
    ("Responding to reviews", "What to say to five stars, three stars and one star.", "/resources/responding-to-reviews/"),
]
G = {t: (t, d, h) for t, d, h in GUIDE_INDEX}
def g(*names): return [G[n] for n in names]

PAGES.append(guide(
    "follow-up-on-cold-estimates", "GUIDE", "How to follow up on a <span class=\"accent\">cold estimate</span>",
    "A simple cadence and word-for-word scripts for the quotes that went quiet.", 6,
    prose(
        "<p>Most customers who don't reply to an estimate haven't decided against you. They got busy, they're comparing, or they're waiting for someone else to agree. A well-timed, low-pressure message often starts the conversation again. Here is a cadence that respects the customer and your time.</p>",
        "<h2>Before you send anything</h2>",
        "<ul><li><strong>Check the quote is still right.</strong> Prices, availability and the scope should still be accurate.</li><li><strong>Decide who owns it.</strong> One person, one name on the message.</li><li><strong>Know the size.</strong> A $9,000 replacement deserves a call; a $300 repair is fine by text or email.</li></ul>",
        "<h2>A three-touch cadence</h2>",
        "<h3>Touch 1 &mdash; about a week after you sent it</h3>",
        "<blockquote>Hi Dana, it's Sam at Cool Air. I wanted to check that the furnace replacement quote came through okay and see if you had any questions. Happy to walk through the options whenever suits you.</blockquote>",
        "<p>It's short, it gives them an easy way to reply, and it doesn't ask for a decision.</p>",
        "<h3>Touch 2 &mdash; four to six days later</h3>",
        "<blockquote>Hi Dana, following up once more on the furnace quote. If timing or budget is the question, there are a couple of ways we can adjust it. Want me to call you for five minutes?</blockquote>",
        "<p>This one acknowledges the earlier message and offers help with the most common reasons people stall: timing and budget.</p>",
        "<h3>Touch 3 &mdash; the graceful close</h3>",
        "<blockquote>Hi Dana, I don't want to keep bugging you, so this is my last note on the furnace quote. If anything changes, reply here and I'll pick it right back up.</blockquote>",
        "<p>A clear, friendly last message often gets the reply the first two didn't, and it leaves the door open.</p>",
        "<h2>Rules that keep it professional</h2>",
        "<ul><li>Never imply a price will rise unless it truly will.</li><li>Don't guilt-trip. &ldquo;Just checking in&rdquo; works; &ldquo;you haven't responded&rdquo; doesn't.</li><li>Match the channel they used with you.</li><li>Stop after three touches unless they engage.</li></ul>",
        "<h2>Track the outcome</h2>",
        "<p>Record what happened: won, lost or still pursuing. Over a few months you'll learn which quotes you actually win and how much of that follows a follow-up. That's the only way to know whether the effort is paying off.</p>",
        callout("<strong>How Perch&eacute; helps:</strong> it flags the estimates that have gone quiet, ranks them by value and urgency, writes the message and records the outcome. Professional can send the first touches automatically if you opt in.", "info")),
    g("An invoice collection checklist", "The maintenance plan playbook", "Responding to reviews")))

PAGES.append(guide(
    "invoice-collection-checklist", "GUIDE", "An <span class=\"accent\">invoice collection</span> checklist",
    "Get paid for finished work without damaging the relationship.", 5,
    prose(
        "<p>Late payment is rarely malice. Invoices get buried, a spouse thought the other one paid, or the customer is waiting on a check. A consistent, polite process gets most of them paid.</p>",
        "<h2>Before the due date</h2>",
        "<ul><li>Put the due date and payment instructions at the top of every invoice.</li><li>Offer an easy way to pay (card link, ACH, check address).</li><li>Send the invoice the same day the work is finished.</li></ul>",
        "<h2>Day 1 &ndash; 14 past due: a friendly reminder</h2>",
        "<blockquote>Hi Dana, a quick reminder that invoice #1042 for $610 from last month's AC service is now past due. You can pay at the link below, or reply if anything needs correcting. Thank you!</blockquote>",
        "<h2>Day 14 &ndash; 30: a clearer message, and a call for larger amounts</h2>",
        "<p>Reference the invoice number, the amount and the original due date. For anything meaningful, call. A two-minute conversation resolves more than three emails.</p>",
        "<h2>Day 30 and beyond: a firm, calm conversation</h2>",
        "<ul><li>Confirm they received the work and are satisfied.</li><li>Ask directly: &ldquo;When can I expect payment?&rdquo; and write down the date.</li><li>Follow up on that date.</li><li>Know your next step (payment plan, pause on future work, formal notice) before you make the call. Check your local rules and terms; this is not legal advice.</li></ul>",
        "<h2>Know your customer</h2>",
        "<p>A customer who has always paid on time and is now two weeks late probably needs a nudge. A customer who is late every time needs a different approach &mdash; a call, a deposit, or payment at completion.</p>",
        callout("<strong>How Perch&eacute; helps:</strong> it flags invoices once they're past due, estimates the likelihood of collection from that customer's own history, and recommends a reminder or a call. Professional reminders can include a Stripe payment link so the money goes straight to your account.", "info")),
    g("How to follow up on a cold estimate", "The maintenance plan playbook", "Responding to reviews")))

PAGES.append(guide(
    "maintenance-plan-playbook", "GUIDE", "The <span class=\"accent\">maintenance plan</span> playbook",
    "How to design, pitch and renew a plan customers actually keep.", 7,
    prose(
        "<p>A maintenance plan trades a little margin per visit for predictable revenue, fewer emergency calls and a customer who calls you first. Done well it is the most stabilizing thing a seasonal business can build.</p>",
        "<h2>Keep the offer simple</h2>",
        "<ul><li>One or two tiers, not five.</li><li>State exactly what's included: number of visits, what's checked, any discount on repairs, priority scheduling.</li><li>Price it so a single visit is clearly worth it, then make the annual price a small step beyond.</li></ul>",
        "<h2>Who to pitch</h2>",
        "<p>The best prospects are customers who have already paid you for real work. They know you, and they've seen the quality. Look for customers with completed jobs who have never been offered a plan.</p>",
        "<h2>When to pitch</h2>",
        "<ul><li>At the end of a job, when the work is fresh.</li><li>In the shoulder season before a rush, by email.</li><li>After a repair that could have been prevented.</li></ul>",
        "<h2>A short pitch</h2>",
        "<blockquote>Hi Dana, thanks again for choosing Cool Air for the install. Many customers add our yearly tune-up plan &mdash; two visits, priority scheduling and a repair discount. Would you like me to set that up?</blockquote>",
        "<h2>Renewals are where the value is</h2>",
        "<ul><li>Track every renewal date.</li><li>Reach out 30&ndash;45 days ahead.</li><li>Make renewing a single reply.</li><li>If a plan lapses, follow up within a couple of weeks &mdash; the customer is still warm.</li></ul>",
        "<h2>Measure it</h2>",
        "<p>Watch active plans, renewal rate, and recurring revenue at risk. If renewals slip, you'll see it long before the revenue disappears.</p>",
        callout("<strong>How Perch&eacute; helps:</strong> it tracks contract renewals (flagging anything within 45 days or past due), lists customers who've never been offered a plan, and shows recurring revenue at risk. Plan features are part of Professional.", "info")),
    g("How to follow up on a cold estimate", "An invoice collection checklist", "Responding to reviews")))

PAGES.append(guide(
    "responding-to-reviews", "GUIDE", "<span class=\"accent\">Responding to reviews</span> without losing your cool",
    "Simple wording for five-star, three-star and one-star reviews.", 5,
    prose(
        "<p>Future customers read the reviews and, just as importantly, read your replies. A calm reply to a bad review can earn more trust than a page of five-star praise.</p>",
        "<h2>Five stars: thank them, briefly</h2>",
        "<blockquote>Thank you, Dana! We're glad the new system is keeping you comfortable. Call us anytime you need us. &mdash; Cool Air</blockquote>",
        "<h2>Three stars: listen and invite a conversation</h2>",
        "<blockquote>Thank you for the honest feedback, Dana. We'd like to hear what we could have done better &mdash; please call or email us so we can make it right.</blockquote>",
        "<h2>One star: apologize, don't argue, move it offline</h2>",
        "<blockquote>We're sorry your experience wasn't what it should have been, and we appreciate you telling us. We'd like to understand what happened &mdash; please call us directly so we can talk it through.</blockquote>",
        "<h2>Rules</h2>",
        "<ul><li>Reply within a couple of days.</li><li>Never argue facts in public or share private details.</li><li>Don't offer refunds or discounts in a public reply.</li><li>Never ask a reviewer to change or remove their review.</li><li>Keep it short.</li></ul>",
        "<h2>Getting more good reviews</h2>",
        "<p>Ask happy customers a few days after you've been paid. A short email with a direct link to your review page works far better than hoping. Don't ask customers who still owe you money.</p>",
        callout("<strong>How Perch&eacute; helps:</strong> it lists reviews nobody has answered (low ratings first), suggests wording you can copy, and finds recently-paid customers to ask. It never posts or sends without your click.", "info")),
    g("How to follow up on a cold estimate", "An invoice collection checklist", "The maintenance plan playbook")))

# ---------- Resources hub ----------
hub = page_hero("RESOURCES", "Practical guides for <span class=\"accent\">recovering revenue</span>",
                "Playbooks, scripts and tools for home service owners. No fluff, no made-up statistics.", None,
                [("Home", "/"), ("Resources", None)])
hub += section("Guides & playbooks", None, '<div class="grid grid-2">' + "".join(
    f'<a class="card guide-card card-hover" href="{h}"><div class="guide-tag">Guide</div><h3 class="feature-title">{t}</h3><p class="feature-body">{d}</p><div class="guide-meta">Read the guide &rarr;</div></a>'
    for t, d, h in GUIDE_INDEX) + "</div>")
hub += section("Tools & reference", None, cards([
    ("Revenue Leak Calculator", "Plug in your own numbers to estimate what quiet quotes and late invoices may be costing you.", "/resources/revenue-leak-calculator/", "&#129518;"),
    ("Integrations", "What connects today, what's waiting on approval, and how to bring in anything else.", "/resources/integrations/", "&#128279;"),
    ("How Perch&eacute; works", "The path from connecting your data to a recovered dollar, step by step.", "/resources/how-it-works/", "&#9881;"),
], 3), band=True)
hub += cta_band()
PAGES.append(dict(path="/resources/", title="Resources | Perch&eacute;", desc="Guides, scripts and tools for home service owners recovering revenue from cold estimates, unpaid invoices and lapsed customers.", body=hub, schema=""))

# ---------- Calculator ----------
calc = page_hero("TOOL", "Revenue Leak <span class=\"accent\">Calculator</span>",
                 "A back-of-the-envelope estimate built from your own numbers. Change any assumption.", None,
                 [("Home", "/"), ("Resources", "/resources/"), ("Revenue Leak Calculator", None)])
calc += section(None, None, """
<div class="card calc"><div class="calc-grid">
<div>
  <div class="field"><label for="c_est">Estimates you send per month</label><input id="c_est" type="number" min="0" value="40"></div>
  <div class="field"><label for="c_val">Average estimate value ($)</label><input id="c_val" type="number" min="0" value="3500"></div>
  <div class="field"><label for="c_cold">Share that go quiet with no follow-up (%)</label><input id="c_cold" type="number" min="0" max="100" value="30"></div>
  <div class="field"><label for="c_win">Of those, share you could win back with a good follow-up (%)</label><input id="c_win" type="number" min="0" max="100" value="10"></div>
  <div class="field"><label for="c_inv">Invoices unpaid past due right now ($)</label><input id="c_inv" type="number" min="0" value="4000"></div>
  <div class="field"><label for="c_lap">Maintenance customers who didn't come back this year</label><input id="c_lap" type="number" min="0" value="25"></div>
  <div class="field"><label for="c_visit">Value of a maintenance visit ($)</label><input id="c_visit" type="number" min="0" value="220"></div>
  <div class="field"><label for="c_rebook">Share you could rebook (%)</label><input id="c_rebook" type="number" min="0" max="100" value="20"></div>
</div>
<div class="calc-out">
  <div class="kicker">ESTIMATED REVENUE YOU MAY BE LEAVING UNCOLLECTED</div>
  <div class="calc-big" id="o_total">$0</div>
  <div class="kicker" style="margin-bottom:14px;">per month, using the assumptions on the left</div>
  <div class="calc-row"><span>Quiet quotes: value sitting there</span><strong id="o_cold">$0</strong></div>
  <div class="calc-row"><span>&hellip;of which winnable</span><strong id="o_cold_w">$0</strong></div>
  <div class="calc-row"><span>Past-due invoices to collect</span><strong id="o_inv">$0</strong></div>
  <div class="calc-row"><span>Maintenance visits to rebook</span><strong id="o_lap">$0</strong></div>
  <div class="calc-row"><span>Annual equivalent (quotes + visits)</span><strong id="o_year">$0</strong></div>
</div></div>
<p class="kicker" style="margin-top:20px;">These percentages are placeholders for you to replace with your own &mdash; not industry statistics and not a promise. &ldquo;Winnable&rdquo; = quiet quote value &times; your win-back %. Invoices are shown in full because they're already owed. Real results vary; your Perch&eacute; dashboard shows what is actually flagged and recovered in your own data.</p>
</div>
<script>
(function(){
  function n(id){var v=parseFloat(document.getElementById(id).value);return isNaN(v)||v<0?0:v;}
  function f(x){return '$'+Math.round(x).toLocaleString('en-US');}
  function calc(){
    var cold=n('c_est')*n('c_val')*Math.min(n('c_cold'),100)/100;
    var coldW=cold*Math.min(n('c_win'),100)/100;
    var inv=n('c_inv');
    var lap=n('c_lap')*n('c_visit')*Math.min(n('c_rebook'),100)/100;
    document.getElementById('o_cold').textContent=f(cold);
    document.getElementById('o_cold_w').textContent=f(coldW);
    document.getElementById('o_inv').textContent=f(inv);
    document.getElementById('o_lap').textContent=f(lap);
    document.getElementById('o_total').textContent=f(coldW+inv+lap);
    document.getElementById('o_year').textContent=f((coldW+lap)*12);
  }
  document.querySelectorAll('.calc input').forEach(function(i){i.addEventListener('input',calc);});
  calc();
})();
</script>
""")
calc += cta_band("See your real numbers", "Connect your software or upload a spreadsheet and Perch&eacute; shows what's actually flagged &mdash; not an estimate.")
PAGES.append(dict(path="/resources/revenue-leak-calculator/", title="Revenue Leak Calculator | Perch&eacute;", desc="Estimate the revenue your home service business may be leaving uncollected from quiet quotes, late invoices and lapsed maintenance customers.", body=calc, schema=""))

# ---------- Integrations ----------
integ = page_hero("INTEGRATIONS", "Works with the software <span class=\"accent\">you already use</span>",
                  "Connect your field service software, upload a spreadsheet, or send data through our inbound API. Here is exactly where each stands today.", TRIAL + call_btn(),
                  [("Home", "/"), ("Resources", "/resources/"), ("Integrations", None)])
def row(name, kind, status, cls, detail):
    return f'<tr><th>{name}</th><td>{kind}</td><td><span class="pill {cls}">{status}</span></td><td>{detail}</td></tr>'
table = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Source</th><th>Type</th><th>Status</th><th>What it gives Perch&eacute;</th></tr></thead><tbody>' + "".join([
    row("Jobber", "Field service software", "Live", "pill-green", "Clients, quotes, invoices, jobs and requests. Read-only. Tested against a real Jobber account."),
    row("Housecall Pro", "Field service software", "Available", "pill-amber", "Built to Housecall Pro's published API. Connects with an API key. We're still verifying it against live customer accounts &mdash; early users help us finish."),
    row("Service Fusion", "Field service software", "Available", "pill-amber", "Built to Service Fusion's published API. Same early-user note as above."),
    row("Workiz", "Field service software", "Available (partial)", "pill-amber", "Customers, invoices and jobs. Workiz doesn't expose priced quotes to us, so cold estimates aren't available for Workiz accounts."),
    row("ServiceTitan", "Field service software", "In progress", "pill-gray", "ServiceTitan's API is partner-gated. Until then, upload exports or use the inbound API."),
    row("Spreadsheet / CSV", "Upload", "Live", "pill-green", "Customers, estimates, invoices and service visits, with column matching and a preview before anything is saved. Recognizes common status wording like &ldquo;Approved&rdquo; or &ldquo;Awaiting payment.&rdquo;"),
    row("Inbound API", "Any tool that can send a web request", "Live", "pill-green", "Push estimates, invoices and leads from Zapier, Make, GoHighLevel or your own scripts with a private key. Re-sending updates, never duplicates."),
    row("Meta lead ads (Facebook &amp; Instagram)", "Lead source", "Import now &middot; live sync pending", "pill-amber", "Upload your lead-ad export today. A direct connection is built and waiting on Meta's app approval."),
    row("Google Business Profile", "Reviews", "Manual now &middot; live sync pending", "pill-amber", "Add or upload reviews today. A direct connection is built and waiting on Google's API access approval."),
    row("Stripe", "Payments", "Live", "pill-green", "Subscription billing, plus optional Stripe Connect so customers can pay you directly from a reminder."),
    row("Twilio", "Text messages", "Live (Professional)", "pill-green", "Each business gets its own verified number; texts are always sent by your click."),
    row("Slack", "Alerts", "Live (Professional)", "pill-green", "New-flag alerts to a channel you choose."),
]) + "</tbody></table></div>"
integ += section("Where each connection stands", "We list what's genuinely live and what isn't, so you can plan around it.", table)
integ += section("How we keep your data safe", None, cards([
    ("Read-only by design", "Perch&eacute; only reads from your field service software. It cannot create, edit or delete anything there.", None, "&#128274;"),
    ("Encrypted connections", "Access tokens are encrypted at rest, and all traffic runs over HTTPS.", None, "&#128273;"),
    ("You stay in control", "Nothing is sent to a customer without your click, unless you opt in to automatic first-touch emails on Professional.", None, "&#9989;"),
], 3), band=True)
integ += section("Don't see your software?", None, prose(
    "Most tools can export a CSV, and many can send data through Zapier or Make. If you can get estimates, invoices or leads out of your system, you can get them into Perch&eacute;. Tell us what you use via <a href=\"/contact/\">Get in Touch</a> &mdash; it helps us decide what to build next."))
integ += cta_band()
PAGES.append(dict(path="/resources/integrations/", title="Integrations | Perch&eacute;", desc="See what Perch&eacute; connects to today: Jobber, Housecall Pro, Service Fusion, Workiz, spreadsheets, an inbound API, and what's pending approval.", body=integ, schema=""))

# ---------- How it works ----------
how = page_hero("HOW IT WORKS", "From connected data to a <span class=\"accent\">recovered dollar</span>",
                "Five steps, no new workflow to learn. Perch&eacute; runs alongside the software you already use.", TRIAL + call_btn(),
                [("Home", "/"), ("Resources", "/resources/"), ("How It Works", None)])
how += section(None, None, steps([
    ("Connect your data", "Link Jobber, Housecall Pro, Service Fusion or Workiz (read-only), upload a spreadsheet, or send data through the inbound API. Setup takes a few minutes."),
    ("Perch&eacute; scans every night", "It checks estimates, invoices, customers, leads and reviews against thresholds you control."),
    ("You see what's slipping", "A dashboard separates three numbers on purpose: revenue identified, expected recovery (probability-weighted), and revenue actually recovered."),
    ("You follow up in one click", "Each item comes with a ready-to-send message. Professional adds text, Slack alerts and optional automatic first touches."),
    ("We measure the result", "Outcomes are recorded as won, lost or still pursuing. A recovery counts toward Perch&eacute;'s ROI only if a follow-up was sent first."),
]))
how += section("Three numbers, never blended", "A big flagged total isn't the same as money in your pocket. Perch&eacute; keeps them separate.", cards([
    ("Revenue identified", "Everything currently flagged across cold estimates, unpaid invoices and lapsed customers. The raw sum.", None, None),
    ("Expected recovery", "Each item's value multiplied by a transparent probability based on its age and the customer's history. A realistic expectation, not a promise.", None, None),
    ("Revenue recovered", "What actually came back, with a conservative attribution rule so the ROI figure can survive scrutiny.", None, None),
], 3), band=True)
how += section("Rules you can read", None, prose(
    "Perch&eacute;'s detection is deliberately rules-based. Every flag explains itself in plain English using the real numbers behind it, so you can see why it appeared and decide whether to act. There is no hidden score to take on faith."))
how += cta_band()
PAGES.append(dict(path="/resources/how-it-works/", title="How Perch&eacute; Works | Perch&eacute;", desc="How Perch&eacute; goes from connecting your field service data to flagging and tracking recovered revenue.", body=how, schema=""))
