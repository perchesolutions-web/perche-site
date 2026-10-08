"""Shared layout for the Perche marketing site (header, footer, blocks)."""
import html, re

APP = "https://perche-revenue-solutions.vercel.app"
CAL = "https://calendly.com/perchesolutions/free-worldflow-audit"
SITE = "https://perchesolutions.com"

NAV = [
    ("Who We Serve", [
        ("HVAC Contractors", "/who-we-serve/hvac-contractors/", "Maintenance plans, cold quotes and seasonal swings."),
        ("Plumbing & Electrical", "/who-we-serve/plumbing-electrical/", "Repeat work, estimates and invoices that slip."),
        ("Owner-Operators", "/who-we-serve/owner-operators/", "Solo and small crews with no time to chase."),
        ("Growing Teams", "/who-we-serve/growing-teams/", "Multiple techs, one clear view of missed revenue."),
    ]),
    ("What We Solve", [
        ("Cold Estimates", "/solutions/cold-estimates/", "Quotes that went quiet, ranked by what they're worth."),
        ("Unpaid Invoices", "/solutions/unpaid-invoices/", "Work you did that hasn't been paid for."),
        ("Lapsed Customers", "/solutions/lapsed-customers/", "Customers overdue for their next visit."),
        ("Cold Leads", "/solutions/cold-leads/", "Inquiries nobody answered fast enough."),
        ("Reputation", "/solutions/reputation/", "Reviews that need a reply, and happy customers to ask."),
        ("Maintenance Plans", "/solutions/maintenance-plans/", "Plans to renew and customers who never got offered one."),
    ]),
    ("Resources", [
        ("Guides & Playbooks", "/resources/", "Practical how-tos for recovering revenue."),
        ("Revenue Leak Calculator", "/resources/revenue-leak-calculator/", "Estimate what's slipping, with your own numbers."),
        ("Integrations", "/resources/integrations/", "What connects today, and what's coming."),
        ("How It Works", "/resources/how-it-works/", "From connecting your data to a recovered dollar."),
        ("Help Center", APP + "/help", "Answers for current customers."),
    ]),
    ("About", [
        ("Who We Are", "/about/who-we-are/", "Why Perch&eacute; exists."),
        ("Our Approach", "/about/our-approach/", "Explainable, read-only, conservative."),
        ("Trust & Security", "/about/trust-and-security/", "How we handle your data."),
        ("Get in Touch", "/contact/", "Talk to a real person."),
    ]),
]


def e(s):
    return s  # content is authored as HTML-safe


def head(title, desc, path, extra_head="", schema=""):
    url = SITE + path
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/assets/logo-v2.png">
<meta name="theme-color" content="#080810">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Perch&eacute;">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/dashboard-preview.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE}/assets/dashboard-preview.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=5">
{schema}
{extra_head}
{POSTHOG}
</head>
<body>
"""


def nav():
    desk = []
    for label, items in NAV:
        links = "".join(
            f'<a class="menu-link" href="{h}"><span class="menu-link-title">{t}</span><span class="menu-link-desc">{d}</span></a>'
            for t, h, d in items)
        desk.append(
            f'<div class="has-menu"><button class="menu-btn" aria-haspopup="true" aria-expanded="false">{label}<span class="caret">&#9662;</span></button>'
            f'<div class="menu-panel"><div class="menu-panel-inner">{links}</div></div></div>')
    mob = []
    for label, items in NAV:
        links = "".join(f'<a href="{h}">{t}</a>' for t, h, d in items)
        mob.append(f'<div class="mm-group"><button class="mm-toggle" aria-expanded="false">{label}<span class="caret">&#9662;</span></button><div class="mm-links">{links}</div></div>')
    return f"""<div style="height:3px;background:linear-gradient(90deg,var(--red),var(--accent),var(--accent-light));"></div>
<header class="site-nav">
  <div class="nav-row">
    <a href="/" class="brand">
      <img src="/assets/logo-v2.png" alt="Perch&eacute;" width="26" height="26">
      <span class="brand-name">Perch<span>&eacute;</span></span>
    </a>
    <nav class="nav-desktop" aria-label="Main">
      {''.join(desk)}
      <a class="nav-plain" href="/pricing/">Pricing</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-login" href="{APP}/login">Sign In</a>
      <a class="btn btn-primary" href="/contact/">Get in Touch</a>
    </div>
    <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    {''.join(mob)}
    <a class="mm-plain" href="/pricing/">Pricing</a>
    <div class="mm-cta">
      <a class="btn btn-login" href="{APP}/login">Sign In</a>
      <a class="btn btn-primary" href="/contact/">Get in Touch</a>
    </div>
  </div>
</header>
"""


def footer():
    def col(title, items):
        return f'<div class="footer-col"><div class="footer-col-title">{title}</div>' + "".join(
            f'<a href="{h}">{t}</a>' for t, h in items) + "</div>"
    who = [(t, h) for t, h, d in NAV[0][1]]
    solve = [(t, h) for t, h, d in NAV[1][1]]
    res = [(t, h) for t, h, d in NAV[2][1]] + [("Privacy Policy", APP + "/privacy"), ("Terms of Service", APP + "/terms")]
    about = [(t, h) for t, h, d in NAV[3][1]] + [("Pricing", "/pricing/"), ("Sign In", APP + "/login"), ("Start free trial", APP + "/signup")]
    return f"""<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="/assets/logo-v2.png" alt="Perch&eacute;" width="24" height="24">
          <span class="brand-name">Perch<span>&eacute;</span></span>
        </div>
        <div class="footer-tagline">Revenue intelligence for home service businesses. Perch&eacute; finds the money you've already earned or almost earned &mdash; cold quotes, unpaid invoices, lapsed customers, ignored leads and unanswered reviews &mdash; and helps you recover it.</div>
        <div class="footer-addr">Perch&eacute; AI Solutions LLC<br>1100 S Miami Ave, Miami, FL 33130<br><a href="mailto:perchesolutions@gmail.com">perchesolutions@gmail.com</a></div>
      </div>
      {col("Who We Serve", who)}
      {col("What We Solve", solve)}
      {col("Resources", res)}
      {col("Company", about)}
    </div>
    <div class="footer-bottom">
      <div>&copy; 2026 Perch&eacute; AI Solutions LLC</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;">
        <a href="{APP}/privacy">Privacy</a>
        <a href="{APP}/terms">Terms</a>
        <a href="{APP}/security">Security</a>
        <a href="{APP}/subprocessors">Subprocessors</a>
      </div>
    </div>
  </div>
</footer>
<script>
(function(){{
  var hb=document.getElementById('hamburger'),mm=document.getElementById('mobileMenu');
  hb.addEventListener('click',function(){{var o=mm.classList.toggle('open');hb.setAttribute('aria-expanded',o);document.body.classList.toggle('menu-open',o);}});
  document.querySelectorAll('.mm-toggle').forEach(function(b){{b.addEventListener('click',function(){{var g=b.parentElement;var o=g.classList.toggle('open');b.setAttribute('aria-expanded',o);}});}});
  document.querySelectorAll('.menu-btn').forEach(function(b){{
    b.addEventListener('click',function(ev){{ev.stopPropagation();var p=b.parentElement;var was=p.classList.contains('open');document.querySelectorAll('.has-menu.open').forEach(function(x){{x.classList.remove('open');x.firstChild.setAttribute('aria-expanded','false');}});if(!was){{p.classList.add('open');b.setAttribute('aria-expanded','true');}}}});
  }});
  document.addEventListener('click',function(){{document.querySelectorAll('.has-menu.open').forEach(function(x){{x.classList.remove('open');}});}});
  document.addEventListener('keydown',function(ev){{if(ev.key==='Escape'){{document.querySelectorAll('.has-menu.open').forEach(function(x){{x.classList.remove('open');}});}}}});
  document.querySelectorAll('.faq-q').forEach(function(btn){{btn.addEventListener('click',function(){{btn.parentElement.classList.toggle('open');}});}});
}})();
</script>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
</body>
</html>
"""


# ---------- content blocks ----------

def btn(label, href, kind="primary", extra=""):
    return f'<a class="btn btn-{kind}" href="{href}" {extra}>{label}</a>'


TRIAL = btn("Start 14-day free trial", APP + "/signup", "primary", 'style="padding:13px 24px;font-size:14.5px;"')


def call_btn():
    return (f'<a class="btn btn-ghost" href="/contact/" style="padding:13px 24px;font-size:14.5px;">Get in Touch</a>')


def page_hero(eyebrow, title, sub, ctas=None, crumbs=None):
    cr = ""
    if crumbs:
        cr = '<nav class="crumbs" aria-label="Breadcrumb">' + " <span>/</span> ".join(
            f'<a href="{h}">{t}</a>' if h else f"<span>{t}</span>" for t, h in crumbs) + "</nav>"
    c = f'<div class="hero-ctas">{ctas}</div>' if ctas else ""
    return f"""<section class="page-hero"><div class="wrap">{cr}
<div class="eyebrow">{eyebrow}</div>
<h1 class="page-title">{title}</h1>
<p class="page-sub">{sub}</p>{c}</div></section>
"""


def section(title=None, sub=None, body="", band=False, id_=None, center=False):
    t = f'<h2 class="section-title">{title}</h2>' if title else ""
    s = f'<p class="section-sub">{sub}</p>' if sub else ""
    cls = "band" if band else ""
    idattr = f' id="{id_}"' if id_ else ""
    c = " center" if center else ""
    return f'<section class="{cls}{c}"{idattr}><div class="wrap">{t}{s}{body}</div></section>\n'


def cards(items, cols=3):
    out = []
    for it in items:
        icon = f'<div class="card-icon">{it[3]}</div>' if len(it) > 3 and it[3] else ""
        link = f'<a class="card-link" href="{it[2]}">Learn more &rarr;</a>' if len(it) > 2 and it[2] else ""
        out.append(f'<div class="card feature-card card-hover">{icon}<h3 class="feature-title">{it[0]}</h3><p class="feature-body">{it[1]}</p>{link}</div>')
    return f'<div class="grid grid-{cols}">' + "".join(out) + "</div>"


def steps(items):
    out = []
    for i, (t, b) in enumerate(items, 1):
        out.append(f'<div class="card step-card"><div class="step-num">{i}</div><div class="step-title">{t}</div><div class="step-body">{b}</div></div>')
    return f'<div class="grid grid-{min(len(items),4) if len(items) in (2,3,4) else 3}">' + "".join(out) + "</div>"


def prose(*paras):
    return '<div class="prose">' + "".join(p if p.startswith("<") else f"<p>{p}</p>" for p in paras) + "</div>"


def bullets(items):
    return '<ul class="check-list">' + "".join(f'<li><span class="check">&#10003;</span><span>{i}</span></li>' for i in items) + "</ul>"


def callout(text, kind="info"):
    return f'<div class="callout callout-{kind}">{text}</div>'


def faq(items):
    out = []
    for q, a in items:
        out.append(f'<div class="faq-item"><button class="faq-q">{q}<span class="faq-plus">+</span></button><div class="faq-a"><div class="faq-a-inner">{a}</div></div></div>')
    return '<div class="faq-list">' + "".join(out) + "</div>"


def faq_schema(items):
    import json
    return '<script type="application/ld+json">' + json.dumps({
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": re.sub("<[^>]+>", "", q), "acceptedAnswer": {"@type": "Answer", "text": re.sub("<[^>]+>", "", a)}} for q, a in items]
    }, ensure_ascii=False) + "</script>"


def cta_band(title="See what your own numbers say", sub="Start a 14-day free trial &mdash; no card required &mdash; or talk to a real person first."):
    return f"""<section><div class="wrap"><div class="cta-band">
<div><h2 class="cta-title">{title}</h2><p class="cta-sub">{sub}</p></div>
<div class="cta-actions">{TRIAL}{call_btn()}</div></div></div></section>
"""


def mock_flags(rows):
    out = ['<div class="mock-card-wrap"><div class="mock-card" aria-hidden="true">',
           '<div class="mock-head"><div><div class="mock-head-title">Example flags</div><div class="mock-head-sub">Illustrative &mdash; not real customer data</div></div></div>']
    for badge, color, bg, title, sub, val in rows:
        out.append(f'<div class="mock-flag"><span class="mock-badge" style="color:var(--{color});background:var(--{bg});">{badge}</span><div class="mock-flag-body"><div class="mock-flag-title">{title}</div><div class="mock-flag-sub">{sub}</div></div><div class="mock-flag-value" style="color:var(--{color});">{val}</div></div>')
    out.append("</div></div>")
    return "".join(out)


def split(left, right, reverse=False):
    cls = "split reverse" if reverse else "split"
    return f'<div class="{cls}"><div>{left}</div><div>{right}</div></div>'


POSTHOG = ""  # filled by build.py from the original index.html
