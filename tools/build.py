import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import layout
from layout import *

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
orig = open(os.path.join(os.path.dirname(__file__), "index_original.html")).read()
layout.POSTHOG = open(os.path.join(os.path.dirname(__file__), "posthog.html")).read()

def write(path, html):
    html = html.replace(layout.LEGACY_APP, layout.APP)
    d = os.path.join(ROOT, path.strip("/"))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w").write(html)

def full(p):
    return head(p["title"], p["desc"], p["path"], schema=p.get("schema", "")) + nav() + "<main>" + p["body"] + "</main>" + footer()

import pages_solutions, pages_segments, pages_resources, pages_about, pages_seo
import blocks
pages = pages_solutions.PAGES + pages_segments.PAGES + pages_resources.PAGES + pages_about.PAGES + pages_seo.PAGES

# ---------- pricing ----------
faq_items = [
    ("Do you offer a free trial?", "Yes &mdash; 14 days on Starter and Professional. No card is required to sign up and see your first dashboard; you add one only when you choose a plan, and you won't be charged until the trial ends."),
    ("What's the difference between Starter and Professional?", "Starter is the core product: connect your software or a spreadsheet, see flags for cold estimates, unpaid invoices and lapsed customers, work your lead and review inboxes, and follow up by email. Professional adds automatic escalating follow-ups, text messages, Slack alerts, deeper reporting and payment links, plus the First $5K Sprint setup, the text script library, the maintenance plan playbook and the Payback Guarantee."),
    blocks.GUARANTEE_FAQ,
    ("What is Done-For-You?", "A higher-touch plan where our team reviews your flags and sends and manages your follow-up outreach. It starts with a call rather than a self-serve signup. <a href=\"/contact/\" style=\"color:var(--accent-light);\">Book a call</a> to talk it through."),
    ("Can I switch plans or cancel?", "Yes. Cancel any time from Billing &mdash; you keep access through the period you've paid for. You can also export your data as a ZIP."),
    ("Are there setup fees or contracts?", "No setup fees and no long-term contract on Starter or Professional. Pricing is a flat monthly subscription."),
    ("Is there a per-user charge?", "No. You can invite teammates without extra seat fees."),
    ("Do you offer custom or enterprise pricing?", "If you run a larger operation with specific needs, <a href=\"/contact/\" style=\"color:var(--accent-light);\">get in touch</a> and we'll talk it through."),
]
pr = page_hero("PRICING", "Simple pricing, <span class=\"accent\">no surprises</span>",
               "Start self-serve with a 14-day free trial and no card required, or have our team run your follow-ups for you.", None, [("Home", "/"), ("Pricing", None)])
pr += '<section class="wrap" id="pricing" style="padding-top:24px;"><div class="trial-banner"><div class="trial-banner-text">Starter and Professional include a 14-day free trial.</div><div style="font-size:13px;color:var(--muted);">No card required to sign up &mdash; add one only when you pick a plan, and you won\'t be charged until the trial ends.</div></div>' + blocks.pricing_cards() + "</section>"
pr += blocks.guarantee_block("#guarantee-terms")
pr += section("Pricing questions", None, faq(faq_items), band=True)
pr += cta_band()
pages.append(dict(path="/pricing/", title="Perch&eacute; Pricing | Revenue Intelligence for Home Services", desc="Perch&eacute; Starter is $299/month, Professional is $599/month with a payback guarantee, and Done-For-You is $1,500/month. 14-day free trial on self-serve plans.", body=pr, schema=faq_schema(faq_items)))

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

hero = blocks.home_hero(TRIAL, call_btn())

items = re.findall(r'<button class="faq-q">(.*?)<span class="faq-plus">.*?<div class="faq-a-inner">(.*?)</div>', faq_s, re.S)
items = [(q.strip(), a.strip()) for q, a in items]
items.insert(2, blocks.GUARANTEE_FAQ)
home_faq = section("Common questions", "Can't find what you need? Email <a href=\"mailto:" + SUPPORT_EMAIL + "\" style=\"color:var(--accent-light);\">" + SUPPORT_EMAIL + "</a>.", faq(items), center=True, id_="faq")
blocks_pricing = section("Simple pricing", "Start self-serve with a 14-day free trial, or have us run your follow-ups.", blocks.pricing_cards(), center=True, id_="pricing")
home_body = '<div class="home">' + (
    hero +
    blocks.home_statement() +
    blocks.home_bento() +
    blocks.compare_fsm_section() +
    blocks.flag_logic_section().replace('<section class="center" id="flag-logic">','<section class="center dark-sec" id="flag-logic">') +
    blocks.home_how([("Connect", "Link Jobber, Housecall Pro, Service Fusion or Workiz, or upload a spreadsheet. Access is read-only."), ("See what's slipping", "Perch&eacute; flags the quotes, invoices, customers and leads that need attention, in plain English."), ("Follow up in a click", "Review the message, press send, and track what comes back.")]) +
    blocks_pricing +
    home_faq +
    blocks.guarantee_block() +
    blocks.founder_block(small=True) +
    cta_band("Ready to see what you're missing?", "Get your free Money Left on the Table Audit &mdash; no card required &mdash; or book a free 15-minute call.")
) + "</div>"
home_body = home_body.replace('href="#pricing"', 'href="/pricing/"')
schema = "".join(re.findall(r'<script type="application/ld\+json">.*?</script>', orig, re.S))
home_html = (head("Perch&eacute; (Perche) | Revenue Intelligence Software for Home Service Businesses",
                  "Perch&eacute; finds the revenue your business is missing &mdash; cold estimates, unpaid invoices, lapsed customers, ignored leads and unanswered reviews &mdash; and helps you recover it.",
                  "/", schema=schema) + nav() + "<main>" + home_body + "</main>" + footer())
open(os.path.join(ROOT, "index.html"), "w").write(home_html.replace(layout.LEGACY_APP, layout.APP))

# ---------- sitemap ----------
urls = ["/"] + [p["path"] for p in pages]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{SITE}{u}</loc><lastmod>{__import__('datetime').date.today().isoformat()}</lastmod></url>\n" for u in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm)
print(len(pages) + 1, "pages built")
