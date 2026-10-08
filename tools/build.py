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
pages.append(dict(path="/pricing/", title="Pricing | Perch&eacute;", desc="Perch&eacute; Starter is $299/month and Professional is $599/month. Both include a 14-day free trial with no card required to sign up.", body=pr, schema=faq_schema(faq_items)))

for p in pages:
    write(p["path"], full(p))

# ---------- home ----------
def between(s, start, end):
    i = s.index(start); j = s.index(end, i)
    return s[i:j]

hero_and_ticker = between(orig, '<div class="wrap hero">', '<section class="band">')
hero_and_ticker = hero_and_ticker.replace(
    '<h1 class="hero-title">Stop losing <span class="accent">revenue</span> you already earned</h1>',
    '<h1 class="hero-title">Find the <span class="accent">revenue</span> your home service business is missing</h1>')
hero_and_ticker = re.sub(r'<p class="hero-sub">.*?</p>',
    '<p class="hero-sub">Perch&eacute; reads the software you already use and shows you the quotes, invoices, customers, leads and reviews that are quietly costing you money &mdash; with the follow-up already written.</p>',
    hero_and_ticker, count=1, flags=re.S)
hero_and_ticker = hero_and_ticker.replace('<a class="btn btn-ghost" href="#how-it-works"', '<a class="btn btn-ghost" href="/resources/how-it-works/"')
rest_start = orig.index('<section class="band">')
leaks = between(orig, '<section class="band">', '<section class="wrap" id="how-it-works">')
howit = between(orig, '<section class="wrap" id="how-it-works">', '<section class="band">\n  <div class="wrap">\n  <h2 class="section-title">Built to be trusted') if False else None
sections = re.findall(r'<section.*?</section>', orig[rest_start:], re.S)
# sections: 0 leaks band, 1 how-it-works, 2 trust, 3 compare, 4 pricing, 5 faq, 6 contact
leaks_s, how_s, trust_s, compare_s, pricing_s, faq_s = sections[:6]
leaks_s = leaks_s.replace("Three ways revenue quietly slips away", "Five ways revenue quietly slips away") if "Three ways" in leaks_s else leaks_s

solve_cards = cards([(t, d, h, None) for t, h, d in NAV[1][1]], 3)
serve_cards = cards([(t, d, h, None) for t, h, d in NAV[0][1]], 4)
integ_chips = '<div class="chip-row">' + "".join(f'<span class="chip">{n}</span>' for n in ["Jobber", "Housecall Pro", "Service Fusion", "Workiz", "Spreadsheets &amp; CSV", "Inbound API (Zapier, Make, GoHighLevel)", "Meta lead ads", "Google Business Profile", "Stripe", "Slack"]) + '</div><p class="kicker" style="margin-top:16px;">Some connections are still pending platform approval. <a href="/resources/integrations/" style="color:var(--accent-light);">See exactly what is live today &rarr;</a></p>'
res_cards = cards([(t, d, h, None) for t, d, h in pages_resources.GUIDE_INDEX[:3]] , 3)

home_body = (
    hero_and_ticker +
    section("What we solve", "Perch&eacute; looks across your quotes, invoices, customers, leads and reviews and shows you where the money is slipping.", solve_cards, id_="solve") +
    leaks_s.replace('<section class="band">', '<section class="band" id="leaks">', 1) +
    how_s +
    section("Who we serve", "Built first for HVAC, useful for any trade that quotes, invoices and has repeat customers.", serve_cards, band=True, id_="serve") +
    section("Works with the tools you already use", "Connect your field service software, upload a spreadsheet, or send data through the inbound API.", integ_chips) +
    trust_s.replace('<section class="band">', '<section class="band" id="trust">', 1) +
    compare_s +
    pricing_s +
    section("Guides & playbooks", "Practical, no-fluff how-tos. See all in <a href=\"/resources/\" style=\"color:var(--accent-light);\">Resources</a>.", res_cards, band=True) +
    faq_s +
    cta_band("Ready to see what you're missing?", "Start a 14-day free trial &mdash; no card required &mdash; or book a free 15-minute call.")
)
# anchor links inside original sections
home_body = home_body.replace('href="#pricing"', 'href="/pricing/"')
schema = "".join(re.findall(r'<script type="application/ld\+json">.*?</script>', orig, re.S))
home_html = (head("Perch&eacute; | Revenue Intelligence for Home Service Businesses",
                  "Perch&eacute; finds the revenue your home service business is missing &mdash; cold estimates, unpaid invoices, lapsed customers, ignored leads and unanswered reviews &mdash; and helps you recover it.",
                  "/", schema=schema) + nav() + "<main>" + home_body + "</main>" + footer())
open(os.path.join(ROOT, "index.html"), "w").write(home_html)

# ---------- sitemap ----------
urls = ["/"] + [p["path"] for p in pages]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(
    f"  <url><loc>{SITE}{u}</loc></url>\n" for u in urls) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm)
print(len(pages) + 1, "pages built")
