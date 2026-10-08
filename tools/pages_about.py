from layout import *
import re

PAGES = []

# ---------- Who we are ----------
w = page_hero("ABOUT", "Software that finds the money <span class=\"accent\">you already earned</span>",
              "Perch&eacute; is a small, hands-on team building revenue intelligence for home service businesses.", None,
              [("Home", "/"), ("About", None), ("Who We Are", None)])
w += section(None, None, prose(
    "<h2>What we do</h2>",
    "Home service companies generate a stream of quotes, invoices, customers, leads and reviews. Most of it is recorded somewhere and watched by no one. Perch&eacute; reads that data and shows an owner, in plain English, where revenue is slipping away &mdash; then makes the next step a single click.",
    "<h2>Why it matters</h2>",
    "A busy owner can't be everywhere. The quote that went quiet, the invoice nobody chased and the maintenance customer who stopped calling don't show up as a loss on any report. They simply never arrive. We think that's a solvable problem, and it should be solved with software that explains itself rather than a black box.",
    "<h2>Who we build for</h2>",
    "Owner-operators and small teams in HVAC and the wider home service trades. We started with HVAC because its recurring maintenance revenue and seasonal swings make follow-up discipline unusually valuable.",
    "<h2>The company</h2>",
    "Perch&eacute; is operated by Perch&eacute; AI Solutions LLC, based in Miami, Florida. We're small on purpose: when you write to us, a real person answers."))
w += section("What we believe", None, cards([
    ("Explain every number", "If Perch&eacute; flags something, it should be able to say why, using the real data behind it.", None, None),
    ("Don't overclaim", "We separate what's identified from what's expected from what's actually recovered, and we credit ourselves conservatively.", None, None),
    ("Respect your data and your customers", "Read-only connections. Nothing sent to your customers without your say-so unless you opt in.", None, None),
], 3), band=True)
w += section(None, None, callout("<strong>We're early, and we say so.</strong> You won't find invented customer logos, testimonials or statistics on this site. When customers choose to share their experience, it will appear here with their permission.", "honest"))
w += cta_band("Talk to a real person", "Tell us how your business works and we'll tell you honestly whether Perch&eacute; fits.")
PAGES.append(dict(path="/about/who-we-are/", title="Who We Are | Perch&eacute;", desc="Perch&eacute; is a small team building revenue intelligence for home service businesses, based in Miami, Florida.", body=w, schema=""))

# ---------- Our approach ----------
a = page_hero("OUR APPROACH", "Explainable, read-only, <span class=\"accent\">conservative</span>",
              "Four design decisions that shape everything in the product.", None,
              [("Home", "/"), ("About", None), ("Our Approach", None)])
a += section(None, None, cards([
    ("Rules you can read", "Detection is deliberately rules-based: thresholds on dates, amounts and history. Each flag lists its reasons, so there's no score you have to trust blindly. You can change the thresholds.", None, "&#128209;"),
    ("Read-only integrations", "Perch&eacute; pulls estimates, invoices and customers from your software and never writes back. It can't change, create or delete records there.", None, "&#128274;"),
    ("Honest ROI", "Identified, expected and recovered are three separate numbers. Recovered revenue is credited to Perch&eacute; only when a follow-up was sent before it came in.", None, "&#9878;"),
    ("You press send", "Follow-ups go out when you click. Automatic first-touch emails are an opt-in on Professional. Texts are always a manual click, with your own verified number.", None, "&#9757;"),
], 2))
a += section("How the numbers are built", None, prose(
    "<h3>Revenue identified</h3><p>The sum of everything currently flagged as cold estimates, unpaid invoices and lapsed customers. It is intentionally the unadjusted figure.</p>",
    "<h3>Expected recovery</h3><p>Each flagged item's value multiplied by a probability that depends on its type, its age and, for invoices, that customer's on-time payment history. Older items are less likely to come back, and the model says so.</p>",
    "<h3>Revenue recovered</h3><p>Items that actually resolved in your favor &mdash; a quote won, an invoice paid, a customer rebooked &mdash; using the amount that really came in.</p>",
    "<h3>What we keep separate</h3><p>Upsell opportunities, new leads and expiring contracts are not folded into the &ldquo;at risk&rdquo; total. They aren't lost revenue yet, and adding them would make the headline number look bigger than it is.</p>"), band=True)
a += section("On &ldquo;revenue intelligence&rdquo;", None, callout("By revenue intelligence we mean software that gathers the signals about money in your business &mdash; jobs, invoices, customers, leads, reviews &mdash; and turns them into a prioritized, explained list of what to do next. It is not a promise of any specific financial result.", "info"))
a += cta_band()
PAGES.append(dict(path="/about/our-approach/", title="Our Approach | Perch&eacute;", desc="Perch&eacute; is explainable, read-only and conservative: readable rules, no write-back to your software, and honest ROI.", body=a, schema=""))

# ---------- Trust & security ----------
t = page_hero("TRUST & SECURITY", "Built to be <span class=\"accent\">trusted with your data</span>",
              "What we collect, how we protect it, and what we will never do.", None,
              [("Home", "/"), ("About", None), ("Trust & Security", None)])
t += section("What we protect and how", None, cards([
    ("Encryption", "Connected-account tokens and sensitive fields are encrypted at rest. All traffic runs over HTTPS.", None, "&#128273;"),
    ("Passwords and sign-in", "Passwords are hashed, never stored in plain text. Two-factor authentication (authenticator app) is available.", None, "&#128272;"),
    ("Read-only access", "We never create, edit or delete anything in Jobber, Housecall Pro, Service Fusion or Workiz.", None, "&#128065;"),
    ("Tenant isolation", "Each business's data is scoped to that business. We've tested that one account can't see another's.", None, "&#128737;"),
    ("Rate limiting and monitoring", "Sensitive endpoints are rate-limited, and errors are monitored so problems are caught quickly.", None, "&#128200;"),
    ("Your data, your call", "Export all your data as a ZIP any time. Delete your account and it's permanently removed.", None, "&#128451;"),
], 3))
t += section("What we will never do", None, bullets([
    "Sell your data or your customers' data.",
    "Hold or move your customers' money. Optional card payments go from your customer to your own Stripe account.",
    "Send messages to your customers without your click (automatic first touches are an opt-in on Professional).",
    "Write changes into your field service software.",
]), band=True)
t += section("Read the details", None, prose(
    f"Our full <a href=\"{APP}/security\">security overview</a>, <a href=\"{APP}/subprocessors\">subprocessor list</a>, <a href=\"{APP}/privacy\">privacy policy</a> and <a href=\"{APP}/terms\">terms of service</a> live in the product so there's a single source of truth. Questions or want to report a concern? <a href=\"/contact/\">Get in touch</a> or email <a href=\"mailto:perchesolutions@gmail.com\">perchesolutions@gmail.com</a>."))
t += cta_band()
PAGES.append(dict(path="/about/trust-and-security/", title="Trust & Security | Perch&eacute;", desc="How Perch&eacute; protects your data: encryption, read-only access, two-factor sign-in, tenant isolation and clear limits on what we do.", body=t, schema=""))

# ---------- Contact ----------
c = page_hero("GET IN TOUCH", "Talk to a <span class=\"accent\">real person</span>",
              "Questions before you start? Want to see whether Perch&eacute; fits how you run your business? We read everything.", None,
              [("Home", "/"), ("Contact", None)])
c += section(None, None, '<div class="split"><div>' + cards([
    ("Book a free 15-minute call", f"Pick a time that suits you. <br><br><a class=\"btn btn-primary\" href=\"{CAL}\" target=\"_blank\" rel=\"noopener\" onclick=\"if(window.Calendly){{Calendly.initPopupWidget({{url:'{CAL}'}});return false;}}\">Book a call</a>", None, "&#128222;"),
    ("Email us", "<a href=\"mailto:perchesolutions@gmail.com\" style=\"color:var(--accent-light);\">perchesolutions@gmail.com</a>", None, "&#9993;"),
    ("Already a customer?", f"<a href=\"{APP}/help\" style=\"color:var(--accent-light);\">Visit the Help Center</a> or <a href=\"{APP}/login\" style=\"color:var(--accent-light);\">sign in</a> and open a support ticket from your account.", None, "&#128101;"),
], 1) + '</div><div><div class="card contact-card" style="text-align:left;max-width:none;">' + """
    <h2 class="section-title" style="font-size:22px;margin-bottom:6px;">Send us a note</h2>
    <p class="section-sub" style="margin:0 0 20px;font-size:13.5px;">Perch&eacute; is a small, hands-on team, so you'll hear from a real person.</p>
    <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks">
      <input type="hidden" name="form-name" value="contact">
      <p class="hp-field"><label>Don't fill this out: <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      <div class="field-row">
        <div class="field"><label for="cf-name">Your name</label><input id="cf-name" name="name" type="text" required></div>
        <div class="field"><label for="cf-email">Business email</label><input id="cf-email" name="email" type="email" required></div>
      </div>
      <div class="field"><label for="cf-business">Business name</label><input id="cf-business" name="business" type="text"></div>
      <div class="field"><label for="cf-software">What software do you use today? (optional)</label><input id="cf-software" name="software" type="text" placeholder="Jobber, Housecall Pro, spreadsheet, other&hellip;"></div>
      <div class="field"><label for="cf-message">What's your question?</label><textarea id="cf-message" name="message" required></textarea></div>
      <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;">Send</button>
    </form>
""" + "</div></div></div>")
PAGES.append(dict(path="/contact/", title="Get in Touch | Perch&eacute;", desc="Book a free 15-minute call, email, or send a note to the Perch&eacute; team.", body=c, schema=""))
