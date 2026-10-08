from layout import *

def segment(slug, eyebrow, h1, sub, intro, pains, covers, fit, faqs, related):
    path = f"/who-we-serve/{slug}/"
    body = page_hero(eyebrow, h1, sub, TRIAL + call_btn(), [("Home", "/"), ("Who We Serve", None), (eyebrow.title().replace("Hvac", "HVAC").replace("&", "&amp;"), None)])
    body += section(None, None, prose(*intro))
    body += section("Where the money slips away for you", None, cards(pains, 3), band=True)
    body += section("What Perch&eacute; does about it", None, cards(covers, 3))
    body += section("Is Perch&eacute; a good fit?", None, split(
        '<h3 class="feature-title" style="font-size:18px;">A good fit if&hellip;</h3>' + bullets(fit[0]),
        '<h3 class="feature-title" style="font-size:18px;">Probably not yet if&hellip;</h3>' + bullets(fit[1])), band=True)
    body += section("Common questions", None, faq(faqs))
    body += section("Explore", None, cards(related, 3), band=True)
    body += cta_band()
    nice = eyebrow.title().replace("Hvac", "HVAC").replace("&", "&amp;")
    return dict(path=path, title=f"{nice} | Perch&eacute;", desc=sub[:155], body=body, schema=faq_schema(faqs))

ALL = {t: (t, d, h) for t, h, d in NAV[1][1]}
def rel(*n): return [ALL[x] for x in n]

PAGES = []

PAGES.append(segment(
    "hvac-contractors", "HVAC CONTRACTORS",
    "Built first for <span class=\"accent\">heating and cooling</span> businesses",
    "HVAC revenue is seasonal, high-ticket and full of follow-ups. Perch&eacute; keeps the quotes, invoices and maintenance customers from falling through the cracks.",
    ["An HVAC shop lives on a handful of high-value moments: a system replacement quote, a spring tune-up, a winter emergency call. Each one creates a follow-up that somebody has to remember. In peak season, nobody does.",
     "Perch&eacute; was designed around that rhythm. It watches the quotes that went quiet, the invoices that aged, and the maintenance customers who didn't come back &mdash; and it uses an HVAC-shaped seasonal curve to show when demand is likely to spike."],
    [("Big quotes go cold", "A $9,000 system replacement can sit unanswered for weeks while the crew is buried in service calls.", None, None),
     ("Maintenance customers drift", "A customer who skipped this year's tune-up is the easiest sale you'll ever make &mdash; and the easiest to forget.", None, None),
     ("Peak season swallows follow-up", "In a heat wave or cold snap the office runs on triage. Collections and quote follow-up wait.", None, None)],
    [("Cold-estimate recovery queue", "Quotes ranked by value and urgency, with the reasons shown.", "/solutions/cold-estimates/", None),
     ("Maintenance-plan tracking", "Renewal dates, lapsed plans and who to offer one to.", "/solutions/maintenance-plans/", None),
     ("Seasonal demand forecast", "A starting HVAC seasonal curve, blended with your own history as it builds (Professional).", None, None)],
    (["You send estimates for installs or replacements and don't always follow up",
      "You sell or want to sell maintenance plans",
      "You use Jobber, Housecall Pro, Service Fusion, Workiz &mdash; or a spreadsheet",
      "The owner or office manager would act on a short daily list"],
     ["You have no history yet (a brand-new business shows little on day one)",
      "You use software we can't read and can't export from (the inbound API and spreadsheets usually bridge this)",
      "You want a full CRM or dispatching tool &mdash; Perch&eacute; sits on top of one, it doesn't replace it"]),
    [("Does Perch&eacute; work with ServiceTitan?", "Not yet. ServiceTitan's API is partner-gated and we're working on access. In the meantime you can upload exports or use the inbound API."),
     ("Is the seasonal forecast reliable?", "It starts from a general HVAC pattern and says so. As your own data builds, each month is labelled by how much of it comes from your history."),
     ("Do I need to change how my team works?", "No. Perch&eacute; reads your data and produces a list; your team acts on it however they already work.")],
    rel("Cold Estimates", "Maintenance Plans", "Lapsed Customers")))

PAGES.append(segment(
    "plumbing-electrical", "PLUMBING & ELECTRICAL",
    "The same leaks, <span class=\"accent\">different trade</span>",
    "Plumbers and electricians quote jobs, send invoices and have customers who come back. Perch&eacute; finds the ones that stalled.",
    ["Quotes for repipes, panel upgrades and fixture installs get sent and then go quiet. Invoices wait on a homeowner who meant to pay. Past customers who'd gladly book a water-heater flush or a safety inspection never hear from you again.",
     "Perch&eacute; reads estimates, invoices and service history, which every field service business produces, so the same detection works for plumbing and electrical shops. We built it HVAC-first, so the examples and seasonal curve lean HVAC &mdash; but cold quotes and overdue invoices look the same in every trade."],
    [("Quotes for bigger jobs stall", "Repipes, panel upgrades and remodels take time to decide &mdash; and time is how a quote dies.", None, None),
     ("Small invoices add up", "A $240 service call unpaid for a month is easy to forget, until there are thirty of them.", None, None),
     ("Repeat customers go silent", "Inspections, flushes and safety checks are natural repeat visits nobody schedules.", None, None)],
    [("Estimate and invoice watching", "Open quotes and past-due invoices, flagged nightly.", "/solutions/cold-estimates/", None),
     ("Lapsed-customer reminders", "Anyone with a service history who's overdue for a repeat visit.", "/solutions/lapsed-customers/", None),
     ("Review requests and replies", "Turn finished jobs into reviews and answer the ones that need it.", "/solutions/reputation/", None)],
    (["You send written estimates and issue invoices from field service software or a spreadsheet",
      "You have repeat customers (inspections, flushes, maintenance checks)",
      "You'd like to follow up more but don't have a system"],
     ["You mostly do same-day cash jobs with no estimates or invoices to track",
      "You don't keep customer or job records anywhere digital"]),
    [("Is Perch&eacute; built for plumbers?", "It was built HVAC-first. The estimate, invoice and lapsed-customer detection is trade-neutral, but the maintenance-plan and seasonal features are tuned for HVAC. We'll tell you plainly in a call if it's not the right fit."),
     ("Which software does it read?", "Jobber, Housecall Pro, Service Fusion and Workiz, plus spreadsheets and our inbound API.")],
    rel("Unpaid Invoices", "Cold Estimates", "Reputation")))

PAGES.append(segment(
    "owner-operators", "OWNER-OPERATORS",
    "You're the tech, the dispatcher <span class=\"accent\">and the bookkeeper</span>",
    "If you run a solo shop or a small crew, nobody has time to chase every quote and invoice. Perch&eacute; does the watching so you can do the work.",
    ["When you're also the person under the sink, follow-up happens at 10 p.m. if it happens at all. You know some quotes went unanswered. You know a couple of invoices are late. You just can't see the whole picture.",
     "Perch&eacute; gives you one short list each morning: who to follow up with, who owes you, and which past customers are due. The message is already written."],
    [("No time between jobs", "You're driving, wrenching and quoting. Follow-up is the first thing to slip.", None, None),
     ("No back-office", "There's no one whose job is collections or customer retention. It's you.", None, None),
     ("Every missed job hurts", "With a small crew, one lost $4,000 install is a real number.", None, None)],
    [("A daily list, not a dashboard to study", "The most valuable follow-ups at the top.", None, None),
     ("Messages written for you", "Short, friendly, ready to send in one click.", None, None),
     ("Plain pricing", "$299 a month on Starter, 14-day free trial, no card to start.", "/pricing/", None)],
    (["You run a solo or small-crew shop",
      "You use Jobber, Housecall Pro, Service Fusion or Workiz, or you keep a spreadsheet",
      "You're willing to spend a few minutes a day sending follow-ups"],
     ["You want something fully hands-off that contacts customers without your say-so on every plan (automatic first touches are on Professional, opt-in)",
      "Your monthly revenue is too small for $299 to make sense &mdash; run the calculator and see"]),
    [("Is it worth $299 a month for a small shop?", "That depends on your numbers. Our Revenue Leak Calculator uses your own inputs, and the trial is free, so you can see what Perch&eacute; actually finds before paying anything."),
     ("I only have a spreadsheet. Is that enough?", "Yes, as long as it has customers, estimates and invoices with dates and amounts. Perch&eacute; helps you match your columns.")],
    rel("Cold Estimates", "Unpaid Invoices", "Lapsed Customers")))

PAGES.append(segment(
    "growing-teams", "GROWING TEAMS",
    "More techs, more jobs, <span class=\"accent\">more places to leak</span>",
    "As you add crews and an office, follow-up depends on who remembers. Perch&eacute; gives the whole team one shared view of missed revenue.",
    ["Growth creates handoffs: the tech quotes, the office schedules, someone else invoices. Every handoff is a chance for a quote to stall or an invoice to age without anyone owning it.",
     "Perch&eacute; gives your team one list, lets you assign a flag to a person, and shows how quickly follow-ups are happening &mdash; so the work doesn't depend on one person's memory."],
    [("Ownership is fuzzy", "Everyone assumes someone else is chasing the quote.", None, None),
     ("Data lives in different places", "Estimates in the FSM, leads in ads, reviews on Google. Nobody sees the whole picture.", None, None),
     ("You can't tell what's working", "Which lead source converts? How fast do you respond? Is follow-up happening at all?", None, None)],
    [("Teams and roles", "Invite owners, admins and staff; assign flags to people.", None, None),
     ("Reports and exports", "CSV and PDF reports, trend charts and a peer benchmark (Professional).", None, None),
     ("Automatic first touches", "Optional escalating emails (up to three) so the first nudge never depends on a person remembering (Professional).", None, None)],
    (["You have several techs or an office team",
      "More than one person touches estimates and invoices",
      "You want visibility into follow-up speed and lead sources"],
     ["You need multi-location rollups or custom permissions &mdash; those aren't built yet",
      "You need a native mobile app (the site works in a phone browser)"]),
    [("Can several people use one account?", "Yes. Owners can invite admins and staff. Teammates can work flags; only the owner manages billing and the team."),
     ("Is there multi-location support?", "Not yet. If you need it, tell us &mdash; it helps us prioritize.")],
    rel("Cold Leads", "Reputation", "Maintenance Plans")))
