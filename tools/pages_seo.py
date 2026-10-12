from layout import *
import re

PAGES = []


def _plain(s):
    return re.sub(r"<[^>]+>", "", s)


def _page(path, title, desc, body, faqs=None):
    return dict(path=path, title=title, desc=desc, body=body, schema=faq_schema(faqs) if faqs else "")


# ============================================================
# Pillar: revenue intelligence for home services
# ============================================================
faqs = [
    ("What is revenue intelligence for home services?",
     "Revenue intelligence for home services is software that reads the data a home service business already creates &mdash; estimates, invoices, customers, leads, reviews &mdash; and shows the owner where money is being missed, how much it is worth and what to do next. It focuses on revenue a business already earned or almost earned, not on generating brand-new demand."),
    ("How is it different from CRM or field service software?",
     "Field service software (Jobber, Housecall Pro, ServiceTitan and similar) records the work. Revenue intelligence sits on top, watches that record, and flags what slipped: the quote nobody followed up on, the invoice that went overdue, the customer who stopped coming back."),
    ("Which home service businesses is it for?",
     "HVAC, plumbing, electrical and other trades that send estimates, invoice after the job and rely on repeat customers. It is especially useful for owner-operators and small teams who don't have an office manager chasing every loose end."),
    ("Does revenue intelligence need artificial intelligence?",
     "Not necessarily. The most useful signals are simple and explainable: an estimate sent three weeks ago with no reply, an invoice 30 days past due, a customer who normally visits every six months and has been gone for fourteen. Perch&eacute; uses clear rules for detection so every flag can be explained in plain English."),
    ("What data does it need?",
     "Estimates, invoices, customers and service history. Perch&eacute; connects read-only to Jobber, Housecall Pro, Service Fusion and Workiz, or accepts a spreadsheet upload or an inbound API feed."),
    ("How long does it take to see results?",
     "Setup takes minutes, and the first scan shows what is already sitting in your data. Whether any of it converts depends on your follow-up, which is why every flag comes with a ready-to-send message."),
]

body = page_hero("REVENUE INTELLIGENCE", "Revenue intelligence for <span class=\"accent\">home service businesses</span>",
                 "What it is, what it should cover, and how to tell real revenue intelligence from another dashboard.",
                 TRIAL + call_btn(), [("Home", "/"), ("Revenue Intelligence for Home Services", None)])

body += section(None, None, prose(
    "<h2>What revenue intelligence means in home services</h2>",
    "<p>Every home service business sits on a quiet pile of money. It is in the estimates that were sent and never answered, the invoices that went past due, the customers who used to book a yearly tune-up and stopped, the web inquiries nobody called back, and the reviews nobody replied to. None of it shows up as a problem, because nothing is broken. It is just unattended.</p>",
    "<p><strong>Revenue intelligence</strong> is the practice, and the software, that makes that pile visible. It reads the data your field service software already holds, works out what is slipping, puts a dollar value on it, and tells you what to do next. The goal is not more reports. It is a short list of people to contact today.</p>",
    "<h2>The five places home service revenue leaks</h2>",
    "<ul>"
    "<li><strong><a href=\"/solutions/cold-estimates/\">Cold estimates</a>.</strong> Quotes sent and never answered. Often the largest single bucket because estimates are high-ticket.</li>"
    "<li><strong><a href=\"/solutions/unpaid-invoices/\">Unpaid invoices</a>.</strong> Work already done and not yet paid for, sorted by age and by how each customer usually pays.</li>"
    "<li><strong><a href=\"/solutions/lapsed-customers/\">Lapsed customers</a> and <a href=\"/solutions/maintenance-plans/\">maintenance plans</a>.</strong> People who stopped coming back, and plans nobody renewed.</li>"
    "<li><strong><a href=\"/solutions/cold-leads/\">Cold leads</a>.</strong> Inquiries from your website, Facebook or Instagram that nobody followed up fast enough.</li>"
    "<li><strong><a href=\"/solutions/reputation/\">Reviews</a>.</strong> Unanswered reviews, and happy customers you never asked.</li>"
    "</ul>",
    "<h2>What good revenue intelligence looks like</h2>",
    "<p>There are plenty of dashboards. A tool earns the name when it does these things:</p>",
    "<ul>"
    "<li><strong>It separates three numbers.</strong> Revenue identified (everything flagged), expected recovery (what is realistically likely to come back), and revenue recovered (what actually did). Blending them inflates the promise.</li>"
    "<li><strong>It explains itself.</strong> Each flag says why it was raised, in plain English, using your real dates and amounts.</li>"
    "<li><strong>It makes the next step one click.</strong> A ready-to-send message for each item, so insight turns into action.</li>"
    "<li><strong>It measures outcomes honestly.</strong> A recovery counts toward ROI only if a follow-up was actually sent first.</li>"
    "<li><strong>It works with the software you already have.</strong> No rip-and-replace.</li>"
    "</ul>",
    "<h2>How Perch&eacute; approaches it</h2>",
    "<p>Perch&eacute; connects read-only to <a href=\"/resources/integrations/\">Jobber, Housecall Pro, Service Fusion and Workiz</a>, or takes a spreadsheet or an inbound API feed. Every night it scans for the five leaks above and updates your dashboard. Detection is rules-based and explainable. Nothing is sent to a customer without your click unless you opt in to automatic first-touch emails. You can read more on <a href=\"/about/our-approach/\">our approach</a> and <a href=\"/resources/how-it-works/\">how it works</a>.</p>",
))
body += section("Revenue intelligence vs. the tools you already have", "They do different jobs. Most businesses need the first and the last.", split(
    prose("<h3>Field service software</h3><p>Records jobs, schedules crews, sends estimates and invoices. It is the system of record.</p>"
          "<h3>Marketing automation</h3><p>Sends campaigns to lists. Useful for new demand, but it does not tell you which of your existing customers and quotes need attention.</p>"),
    prose("<h3>Revenue intelligence</h3><p>Watches the system of record for what slipped, prices it, and prompts the follow-up. It sits on top of the tools above rather than replacing them.</p>"
          "<h3>Accounting software</h3><p>Tracks what was paid. It rarely connects an unpaid invoice to the quote and customer history behind it.</p>")), band=True)
body += section("Common questions", None, faq(faqs), id_="faq")
body += cta_band("See what's slipping in your own business", "Start a 14-day free trial &mdash; no card required &mdash; or book a free 15-minute call.")
PAGES.append(_page("/revenue-intelligence-for-home-services/",
    "Revenue Intelligence for Home Service Businesses | Perch&eacute;",
    "Revenue intelligence for home services: find cold estimates, unpaid invoices, lapsed customers, ignored leads and unanswered reviews, with the follow-up already written.",
    body, faqs))

# ============================================================
# Buyer's guide
# ============================================================
faqs2 = [
    ("Do I need revenue intelligence if I already use ServiceTitan, Jobber or Housecall Pro?",
     "Those tools record the work and include some follow-up features. A revenue intelligence layer is for owners who want one ranked list of everything that slipped across quotes, invoices, customers and leads, with the dollar value and a ready message for each."),
    ("Should I pick software that generates new leads or software that recovers revenue I already earned?",
     "They solve different problems. Lead generation pays to attract new demand. Recovery works on quotes, invoices and customers you already have, which usually costs less to convert. Many shops start with recovery."),
    ("What should it cost?",
     "Prices vary widely and some vendors only quote after a demo. Perch&eacute; publishes its pricing: <a href=\"/pricing/\">Starter at $299 per month and Professional at $599 per month</a>, both with a 14-day free trial."),
]
b2 = page_hero("BUYER'S GUIDE", "How to choose revenue intelligence software for a <span class=\"accent\">home service business</span>",
               "Eight questions to ask any vendor, including us.", TRIAL + call_btn(),
               [("Home", "/"), ("Resources", "/resources/"), ("Buyer's Guide", None)])
b2 += section(None, None, prose(
    "<p>Searching for revenue intelligence software for HVAC, plumbing or electrical work turns up a mix of enterprise platforms, marketing tools and add-ons. Use these questions to sort them.</p>",
    "<h2>1. Which problem does it actually solve?</h2>",
    "<p>Some products find new customers. Others, like Perch&eacute;, find revenue you already earned or nearly earned. Decide which problem is costing you more right now.</p>",
    "<h2>2. Does it work with your field service software?</h2>",
    "<p>Check the integration list for the tool you actually use, and ask what is live versus planned. See where <a href=\"/resources/integrations/\">our integrations stand</a>, including the ones that are still in progress.</p>",
    "<h2>3. Is access read-only?</h2>",
    "<p>You should be able to connect without giving a vendor the ability to change your records.</p>",
    "<h2>4. Can it explain every flag?</h2>",
    "<p>If you cannot see why a customer was flagged, you cannot trust the number. Look for plain-language reasons built from your own data.</p>",
    "<h2>5. How does it measure results?</h2>",
    "<p>Ask what counts as recovered. A fair system only counts a win if the vendor's follow-up preceded it, and keeps identified, expected and recovered revenue as separate figures.</p>",
    "<h2>6. Who sends the messages?</h2>",
    "<p>Decide whether you want one click per message or full automation. Perch&eacute; defaults to your click and offers opt-in automatic first touches on Professional.</p>",
    "<h2>7. How long until it is useful?</h2>",
    "<p>You should see real flags from your own data in the first session, not after a multi-week onboarding.</p>",
    "<h2>8. Is the price public?</h2>",
    "<p>If pricing is hidden behind a demo, ask for it in writing before you invest time. Ours is on the <a href=\"/pricing/\">pricing page</a>.</p>",
))
b2 += section("Common questions", None, faq(faqs2), band=True)
b2 += cta_band()
PAGES.append(_page("/resources/revenue-intelligence-software-buyers-guide/",
    "How to Choose Revenue Intelligence Software for Home Services | Perch&eacute;",
    "Eight questions to ask when comparing revenue intelligence software for HVAC, plumbing and electrical businesses.",
    b2, faqs2))

# ============================================================
# Retention guide
# ============================================================
b3 = page_hero("GUIDE", "How to keep <span class=\"accent\">HVAC customers</span> coming back",
               "A practical look at customer retention for home service businesses, and how to spot drift early.", None,
               [("Home", "/"), ("Resources", "/resources/"), ("Customer Retention", None)])
b3 += section(None, None, '<div class="article-meta">5 min read &middot; Perch&eacute; Team</div>' + prose(
    "<p>Most home service customers don't leave on purpose. They drift. The yearly tune-up slips a month, then a season, and one day a competitor's postcard arrives while you haven't spoken to them in two years.</p>",
    "<h2>Measure drift against each customer's own rhythm</h2>",
    "<p>A single cutoff, such as &ldquo;no visit in 12 months,&rdquo; treats everyone the same. A customer who normally books every six months and has been gone for eleven is more at risk than one who always books every two years. Compare each person's time since the last visit with their own usual gap between visits.</p>",
    "<h2>Four simple retention habits</h2>",
    "<ul><li><strong>Book the next visit before the tech leaves.</strong> A maintenance plan is the easiest way.</li>"
    "<li><strong>Send a reminder a few weeks before the usual interval.</strong> Not after it has already passed.</li>"
    "<li><strong>Follow up on declined work.</strong> A customer who said &ldquo;not now&rdquo; to a repair often still needs it. See <a href=\"/resources/follow-up-on-cold-estimates/\">how to follow up on a cold estimate</a>.</li>"
    "<li><strong>Renew plans proactively.</strong> Our <a href=\"/resources/maintenance-plan-playbook/\">maintenance plan playbook</a> covers pricing, pitching and renewing.</li></ul>",
    "<h2>Let software watch for drift</h2>",
    "<p>Perch&eacute; flags <a href=\"/solutions/lapsed-customers/\">lapsed customers</a> and expiring maintenance contracts from your service history, and writes a friendly check-in for each. You decide who gets contacted.</p>",
))
b3 += cta_band("Spot drifting customers early", "Connect your field service software and see who is overdue.")
PAGES.append(_page("/resources/hvac-customer-retention/",
    "How to Keep HVAC Customers Coming Back | Perch&eacute;",
    "How to reduce customer drift in HVAC and home service: measure against each customer's own rhythm, renew plans early, and follow up on declined work.",
    b3))

# ============================================================
# Alternatives: Arch
# ============================================================
def r(a, b, c):
    return f"<tr><th>{a}</th><td>{b}</td><td>{c}</td></tr>"

tbl = ('<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Perch&eacute;</th><th>Arch</th></tr></thead><tbody>' + "".join([
    r("Built around", "Jobber, Housecall Pro, Service Fusion, Workiz, spreadsheets and an inbound API", "ServiceTitan (native integration)"),
    r("Core idea", "Find revenue you already earned or nearly earned and prompt the follow-up", "AI-driven lead discovery, churn prevention and automated outreach"),
    r("New-prospect discovery from property and permit data", "No", "Yes"),
    r("Direct mail, streaming TV and multi-channel campaigns", "No", "Yes"),
    r("Call classification and CSR coaching", "No", "Yes (Call Intelligence)"),
    r("Cold estimates, unpaid invoices and lapsed customers in one list", "Yes", "Focus is retention and acquisition campaigns"),
    r("Reads data read-only", "Yes", "Not stated on their public pages"),
    r("Pricing", "Published: $299 and $599 per month, 14-day free trial", "Not published on their site; demo-based"),
    r("Typical fit", "Owner-operators and small to mid-size shops", "Larger ServiceTitan operators and PE-backed platforms"),
]) + "</tbody></table></div>")

faqs3 = [
    ("Is Perch&eacute; an Arch alternative?",
     "They overlap on the idea of revenue intelligence for home services, but they are built for different shops. Arch is built around ServiceTitan and adds outbound marketing and call intelligence. Perch&eacute; works with Jobber, Housecall Pro, Service Fusion, Workiz and spreadsheets and focuses on recovering revenue you already earned."),
    ("Can I use Perch&eacute; if I'm on ServiceTitan?",
     "Not directly yet. ServiceTitan's API is partner-gated, so today you would use spreadsheet exports or our inbound API. A direct integration is on our roadmap and we list its status on the <a href=\"/resources/integrations/\">integrations page</a>."),
    ("Does Perch&eacute; send direct mail or find new prospects?",
     "No. Perch&eacute; focuses on the customers, quotes and invoices you already have."),
]
b4 = page_hero("COMPARISON", "Perch&eacute; vs. Arch: <span class=\"accent\">which fits your shop?</span>",
               "A fair side-by-side for home service owners comparing revenue intelligence tools.", TRIAL + call_btn(),
               [("Home", "/"), ("Alternatives", None), ("Arch", None)])
b4 += section("At a glance", "Based on each company's public website at the time of writing. If you spot something out of date, tell us and we'll correct it.", tbl)
b4 += section(None, None, prose(
    "<h2>Where Arch is stronger</h2>",
    "<p>Arch goes broader. It can find new prospects from property and permit data, run direct mail and other channels, and classify inbound calls. If you are a larger ServiceTitan shop that wants an outbound growth engine and call coaching, that breadth matters.</p>",
    "<h2>Where Perch&eacute; is the better fit</h2>",
    "<p>Perch&eacute; is narrower on purpose. It works with the small-shop software stack, connects in minutes with read-only access, shows one clear number, and publishes its price. If your problem is the quotes, invoices and customers you already have, you can start recovering that without a marketing program.</p>",
    "<h2>How to decide</h2>",
    "<ul><li>On ServiceTitan with a marketing team and a growth budget: look at Arch.</li>"
    "<li>On Jobber, Housecall Pro, Service Fusion, Workiz or spreadsheets, and you want to stop leaving money on the table: try Perch&eacute;.</li>"
    "<li>Not sure: read our <a href=\"/resources/revenue-intelligence-software-buyers-guide/\">buyer's guide</a>.</li></ul>",
    "<p class=\"fine\">Arch is a trademark of its owner. Perch&eacute; is not affiliated with or endorsed by Arch.</p>",
), band=True)
b4 += section("Common questions", None, faq(faqs3))
b4 += cta_band()
PAGES.append(_page("/alternatives/arch/",
    "Perch&eacute; vs. Arch: Revenue Intelligence for Home Services Compared | Perch&eacute;",
    "Comparing Perch&eacute; and Arch for home service businesses: integrations, features, pricing and which shop each tool fits.",
    b4, faqs3))


# ============================================================
# Free audit landing page
# ============================================================
au = page_hero("FREE AUDIT", "The Money Left on the Table <span class=\"accent\">Audit</span>",
               "Connect read-only and see the total dollars sitting in cold estimates, unpaid invoices and lapsed customers. No card required.",
               btn("Get My Free Revenue Leak Audit", APP + "/signup", "primary", 'style="padding:13px 24px;font-size:14.5px;"') + call_btn(),
               [("Home", "/"), ("Free Audit", None)])
au += section("How it works", "Three steps, about five minutes.", steps([
    ("Connect read-only", "Link Jobber, Housecall Pro, Service Fusion or Workiz, or upload a spreadsheet. Perch&eacute; can only read; it can't change anything in your software."),
    ("We scan your data", "Perch&eacute; looks across your estimates, invoices and customers for what has gone quiet or unpaid, using plain rules you can read."),
    ("Get your one-page summary", "Your dashboard shows every item, and a summary is emailed to you with the totals for each category and the three biggest items to start with."),
]), center=True)
au += section("What the audit covers", None, cards([
    ("Cold estimates", "Quotes sent and still open, with the total dollars and the biggest ones first.", "/solutions/cold-estimates/"),
    ("Unpaid invoices", "What's past due, how late, and how likely each customer is to pay.", "/solutions/unpaid-invoices/"),
    ("Lapsed customers", "People who used to book maintenance and haven't been back in a year.", "/solutions/lapsed-customers/"),
], 3), band=True, center=True)
au += section("What it doesn't do", None, '<div class="audit-callout">' + prose(
    "<ul><li>It doesn't send anything to your customers. You decide who gets a message.</li>"
    "<li>It doesn't write to your field service software. Access is read-only.</li>"
    "<li>It doesn't ask for a card. You add one only if you choose a plan after your 14-day trial.</li>"
    "<li>It doesn't promise that every flagged dollar will come back. It shows what's there and what is realistically likely to return.</li></ul>") + "</div>")
au += cta_band("See what's slipping in your business", "Start your free audit &mdash; or book a 15-minute call and we'll walk through it together.")
PAGES.append(_page("/audit/", "Free Revenue Leak Audit: The Money Left on the Table Audit | Perch&eacute;",
    "Connect read-only and see how much money is sitting in cold estimates, unpaid invoices and lapsed customers. No card required.", au))

# ============================================================
# Text script library
# ============================================================
def script(title, when, text):
    return f'<h3>{title}</h3><p><em>{when}</em></p><blockquote>{text}</blockquote>'

sl = page_hero("SCRIPTS", "Text script library for <span class=\"accent\">HVAC and plumbing</span>",
               "Short, ready-to-send replies for the objections customers actually raise. Edit the names and details, then send.", None,
               [("Home", "/"), ("Resources", "/resources/"), ("Text Scripts", None)])
sl += section(None, None, '<div class="article-meta">Copy, edit, send</div>' + prose(
    "<p>Texts work best when they are short, specific and easy to answer. Replace the bracketed parts with real details, and send only to customers who have agreed to receive texts from you.</p>",
    "<h2>When an estimate goes quiet</h2>",
    script("First check-in", "About a week after sending the quote", "Hi [name], it's [you] at [company]. Just checking the [job] quote reached you and answering any questions. Happy to talk it through whenever suits."),
    script("Offering help with the usual blockers", "A few days after the first check-in", "Hi [name], following up on the [job] quote. If timing or budget is the question, there are a couple of ways we can adjust it. Want a quick call?"),
    script("The graceful close", "Last touch", "Hi [name], I don't want to keep bugging you, so this is my last note on the [job] quote. If anything changes, reply here and I'll pick it right back up."),
    "<h2>Common objections</h2>",
    script("\"I need to think about it\"", "Reply", "Of course, it's a big decision. Is there anything I can clarify to make it easier? I can also send a one-page summary of the options."),
    script("\"I got a cheaper quote\"", "Reply", "Thanks for telling me. Would you be open to sharing what the other quote covers? I'd like to make sure we're comparing the same equipment, warranty and installation."),
    script("\"I need to talk to my spouse\"", "Reply", "Totally understand. I can put together a short summary you can both look at. Would a call with both of you this week help?"),
    script("\"Not right now\"", "Reply", "No problem. Would it help if I checked back in [month]? I'll note your system's age and what we discussed so we can pick up where we left off."),
    "<h2>Invoices</h2>",
    script("Friendly reminder", "Just past due", "Hi [name], a quick reminder that invoice [#] for $[amount] was due on [date]. You can pay here: [link]. Thanks again for choosing [company]."),
    script("Firmer follow-up", "30+ days past due", "Hi [name], invoice [#] for $[amount] is now [X] days past due. Please pay today at [link] or call me at [number] so we can sort it out."),
    "<h2>Maintenance plans</h2>",
    script("Offering a plan after a visit", "Same day or next day", "Thanks for having us out today, [name]. Many of our customers add our annual plan so their system gets a tune-up each year at a set price. Want me to send the details?"),
    script("Renewal reminder", "30 days before renewal", "Hi [name], your [company] maintenance plan renews on [date]. Reply YES and we'll keep your tune-up booked, or call if you'd like to change anything."),
    "<p>See the <a href=\"/resources/follow-up-on-cold-estimates/\">cold estimate follow-up guide</a>, the <a href=\"/resources/invoice-collection-checklist/\">invoice collection checklist</a> and the <a href=\"/resources/maintenance-plan-playbook/\">maintenance plan playbook</a> for the thinking behind these.</p>",
))
sl += cta_band("Want these sent from the right place at the right time?", "Perch&eacute; flags what needs a message and has one ready for each.")
PAGES.append(_page("/resources/text-script-library/", "Text Script Library for HVAC and Plumbing Follow-Ups | Perch&eacute;",
    "Ready-to-send text scripts for quiet estimates, objections, unpaid invoices and maintenance plan renewals.", sl))
