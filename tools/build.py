import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import layout
from layout import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
orig = open(os.path.join(os.path.dirname(__file__), "index_original.html")).read()
layout.POSTHOG = open(os.path.join(os.path.dirname(__file__), "posthog.html")).read()

def write(path, html):
    d = os.path.join(ROOT, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(html)

def full(p):
    return head(p["title"], p["desc"], p["path"], schema=p.get("schema", "")) + nav() + "<main>" + p["body"] + "</main>" + footer()

import pages_solutions, pages_segments, pages_resources, pages_about
pages = pages_solutions.PAGES + pages_segments.PAGES + pages_resources.PAGES + pages_about.PAGES

# ---------- pricing ----------
m = re.search(r'<section class="wrap" id="pricing">(.*?)</section>', orig, re.S)
pricing_inner = m.group(1)
faq_items = [
    ("Do you offer a free trial?", "Yes &mdash; 14 days on either plan. No card is required to sign up and see your first dashboard; you add one only when you choose a plan, and you won't be charged until the trial ends."),
    ("What's the difference between Starter and Professional?", "Starter covers the core product: connect your software or a spreadsheet, get flagged on cold estimates, unpaid invoices and lapsed customers, and follow up by email. Professional adds automatic escalating follow-ups, text messages, Slack alerts, deeper reporting, maintenance-plan tracking and optional payment collection via Stripe Connect."),
    ("Can I switch plans or cancel?", "Yes. Cancel any time from Billing &mdash; you keep access through the period you've paid for. You can also export your data as a ZIP."),
    ("Are there setup fees or contracts?", "No setup fees and no long-term contract. Pricing is a flat monthly subscription."),
    ("Is there a per-user charge?", "No. You can invite teammates without extra seat fees."),
    ("Do you offer custom or enterprise pricing?", "If you run a larger operation with specific needs, <a href=\"/contact/\" style=\"color:var(--accent-light);\">get in touch</a> and we'll talk it through."),
]
pr = page_hero("PRICING", "Simple pricing, <span class=\"accent\">no surprises</span>",
               "Two flat monthly plans. Both include a 14-day free trial with no card required to start.", None, [("Home", "/"), ("Pricing", None)])
pr += '<section class="wrap" id="pricing" style="padding-top:24px;">' + re.sub(r'<h2 class="section-title">.*?</p>', '', pricing_inner, count=1, flags=re.S) + "</section>"
pr += section("Pricing questions", None, faq(faq_items), band=True)
pr += cta_band()
pages.append(dict(path="/pricing/", title="Perch&eacute; Pricing | Revenue Intelligence for Home Services", desc="Perch&eacute; Starter is $299/month and Professional is $599/month. Both include a 14-day free trial with no card required to sign up.", body=pr, schema=faq_schema(faq_items)))

for p in pages:
    write(p["path"], full(p))

# ---------- home ----------
def between(s, start, end):
    i = s.index(start); j = s.index(end, i)
    return s[i:j]

sections = re.findall(r'<section.*?</section>', orig[orig.index('<section class="band">'):], re.S)
leaks_s, how_s, trust_s, compare_s, pricing_s, faq_s = sections[:6]

what_cards = cards([
    ("Quotes that went quiet", "Estimates that were sent and never answered, ranked by dollars and how cold they are, each with a follow-up ready to send.", "/solutions/cold-estimates/"),
    ("Invoices nobody paid", "Everything past due in one list, with the right nudge for each customer.", "/solutions/unpaid-invoices/"),
    ("Customers who drifted", "Past customers due for service, with a friendly check-in ready to go.", "/solutions/lapsed-customers/"),
    ("Leads and reviews", "Inquiries nobody answered and reviews nobody replied to, in one place.", "/solutions/cold-leads/"),
], 4)

how_cards = steps([
    ("Connect", "Link Jobber, Housecall Pro, Service Fusion or Workiz, or upload a spreadsheet. Access is read-only."),
    ("See what's slipping", "Perch&eacute; flags the quotes, invoices, customers and leads that need attention, in plain English."),
    ("Follow up in a click", "Review the message, press send, and track what comes back."),
])

hero = """<section class="home-hero"><div class="wrap">
<h1 class="home-title">Find the <span class="accent">Revenue</span> Your Business Is Missing</h1>
<p class="home-sub">Perch&eacute; reads the software you already use and shows you the quotes, invoices, customers and leads that are quietly costing you money &mdash; with the follow-up already written.</p>
<div class="home-ctas">""" + TRIAL + call_btn() + """</div>
<div class="home-fine">No card required &middot; Read-only access &middot; Cancel any time</div>
<div class="home-integrates"><span class="home-integrates-label">Works with</span><span>Jobber</span><span>Housecall Pro</span><span>Service Fusion</span><span>Workiz</span><span>Spreadsheets</span></div>
<div class="home-visual">""" + mock_flags([
    ("Cold estimate", "amber", "amber-bg", "Sent 11 days ago, no response", "Furnace replacement quote", "$4,200"),
    ("Unpaid invoice", "red", "red-bg", "27 days past due", "AC tune-up + repair", "$610"),
    ("Lapsed customer", "green", "green-bg", "14 months since last visit", "Due for annual maintenance", "$220"),
]) + """</div></div></section>
"""

home_body = '<div class="home">' + (
    hero +
    section("What Perch&eacute; does", "One place that shows where your money is slipping away, and what to do about it.", what_cards, center=True, id_="solve") +
    section("How it works", "Set up in minutes. No new habits to learn.", how_cards, band=True, center=True, id_="how-it-works") +
    pricing_s +
    faq_s +
    cta_band("Ready to see what you're missing?", "Start a 14-day free trial &mdash; no card required &mdash; or book a free 15-minute call.")
) + "</div>"
home_body = home_body.replace('href="#pricing"', 'href="/pricing/"')
schema = "".join(re.findall(r'<script type="application/ld\+json">.*?</script>', orig, re.S))
home_html = (head("Perch&eacute; (Perche) | Revenue Intelligence Software for Home Service Businesses",
                  "Perch&eacute; finds the revenue your business is missing &mdash; cold estimates, unpaid invoices, lapsed customers, ignored leads and unanswered reviews &mdash; and helps you recover it.",
                  "/", schema=schema) + nav() + "<main>" + home_body + "</main>" + footer())
open(os.path.join(ROOT, "index.html"), "w").write(home_html)

# ---------- sitemap ----------
urls = ["/"] + [p["path"] for p in pages]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{SITE}{u}</loc><lastmod>{__import__('datetime').date.today().isoformat()}</lastmod></url>\n" for u in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm)
print(len(pages) + 1, "pages built")
