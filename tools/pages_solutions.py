from layout import *

def solution_page(slug, eyebrow, h1, sub, problem, how_detect, what_you_get, steps_, flags, honest, faqs, related):
    path = f"/solutions/{slug}/"
    body = page_hero(eyebrow, h1, sub, TRIAL + call_btn(), [("Home", "/"), ("What We Solve", None), (eyebrow.title(), None)])
    body += section(None, None, split(
        prose(*problem),
        mock_flags(flags)))
    body += section("How Perch&eacute; finds it", how_detect[0], bullets(how_detect[1]), band=True)
    body += section("What you get", None, cards(what_you_get, 3))
    body += section("From flag to recovered dollar", None, steps(steps_), band=True)
    body += section("Straight talk", None, callout(honest, "honest"))
    body += section("Common questions", None, faq(faqs), band=True)
    rel = cards([(t, d, h) for t, d, h in related], 3)
    body += section("Related", None, rel)
    body += cta_band()
    return dict(path=path, title=__import__("re").sub(r"<[^>]+>", "", h1) + " | Perch&eacute;", desc=sub[:155], body=body, schema=faq_schema(faqs))

RELATED_ALL = {t: (t, d, h) for t, h, d in __import__("layout").NAV[1][1]}

def rel(*names):
    return [RELATED_ALL[n] for n in names]

PAGES = []

PAGES.append(solution_page(
    "cold-estimates", "COLD ESTIMATES",
    "Quotes that went quiet are <span class=\"accent\">money on the table</span>",
    "Perch&eacute; watches every open estimate, tells you which ones are worth chasing first, and gives you the follow-up message to send.",
    ["Most home service owners send more estimates than they can follow up on. A furnace replacement quote goes out on Tuesday, the phone rings on Wednesday, and by the following week nobody remembers who was waiting on what. The customer didn't say no &mdash; the quote just went quiet.",
     "That is the most expensive kind of lost job, because you did the hard part already: you showed up, diagnosed the problem, and wrote the number down. Everything left is a short, friendly message.",
     "Perch&eacute; reads the estimates already in your field service software (or spreadsheet), measures how long each has gone without customer activity, and ranks the open ones so you know exactly who to contact today."],
    ("Plain rules you can read and change &mdash; no black box.", [
        "An open estimate with no customer activity for <strong>14 days</strong> is flagged (the threshold is yours to change in Settings).",
        "Age is measured from the customer's last real activity, not from when Perch&eacute; first noticed it.",
        "Every estimate shows its reasons in plain English &mdash; for example &ldquo;No customer activity in 35 days&rdquo; or &ldquo;No follow-up has been sent yet.&rdquo;",
        "The recovery queue ranks open estimates by expected value &times; urgency, blending staleness, this customer's own history of saying yes, and whether anyone has followed up.",
        "When an estimate flips to won or converted in your software, the flag clears on its own.",
    ]),
    [("A ranked &ldquo;who to call today&rdquo; list", "Cold estimates sorted by dollars and urgency, with the reasons shown so you trust the order.", None, "&#9873;"),
     ("A ready-to-send follow-up", "A short, friendly message for each estimate. Professional can add a smarter rewrite grounded in what the estimate was for.", None, "&#9993;"),
     ("Honest numbers", "Revenue identified, a probability-weighted expected recovery, and what actually came back &mdash; kept as three different numbers on purpose.", None, "&#36;")],
    [("Connect or upload", "Link Jobber, Housecall Pro, Service Fusion or Workiz (read-only) or upload a spreadsheet."),
     ("We flag the quiet ones", "Every night Perch&eacute; checks each open estimate against your threshold and ranks them."),
     ("You send the follow-up", "One click sends the email (Professional adds text and optional automatic first touches)."),
     ("We track the outcome", "Won, lost, or still pursuing &mdash; and whether a Perch&eacute; follow-up came first.")],
    [("Cold estimate", "amber", "amber-bg", "Sent 11 days ago, no response", "Furnace replacement quote", "$4,200"),
     ("Cold estimate", "amber", "amber-bg", "No follow-up sent yet", "Water heater replacement", "$2,850")],
    "<strong>What we won't promise:</strong> a specific percentage of cold quotes will close. Whether a customer says yes depends on your price, your timing and their situation. Perch&eacute; makes sure no estimate dies from neglect, and it shows you what actually came back so you can judge the value for yourself.",
    [("How does Perch&eacute; know an estimate is &ldquo;cold&rdquo;?", "It compares today's date to the estimate's last customer activity (or creation date). If it's still open past your threshold &mdash; 14 days by default &mdash; it's flagged."),
     ("Will it contact my customers automatically?", "On Starter, never &mdash; every message needs your click. On Professional you can opt in to automatic first-touch emails (up to three, escalating). Text messages are always a manual click."),
     ("What if my software doesn't track estimate activity?", "Perch&eacute; falls back to the estimate's creation date. A spreadsheet works too if it has a customer, value, status and date for each estimate."),
     ("Does Workiz work for cold estimates?", "Workiz doesn't currently expose priced quotes to us, so the cold-estimate category isn't available for Workiz accounts &mdash; the dashboard says so instead of showing a misleading zero.")],
    rel("Unpaid Invoices", "Cold Leads", "Maintenance Plans")))

PAGES.append(solution_page(
    "unpaid-invoices", "UNPAID INVOICES",
    "Work you finished that hasn't been <span class=\"accent\">paid for</span>",
    "Perch&eacute; flags invoices past due, estimates how likely each is to be collected, and tells you whether a reminder or a phone call is the right move.",
    ["Sending a reminder feels awkward, so it slips. Meanwhile the invoice ages, and every week it sits makes it harder to collect.",
     "Perch&eacute; looks at each overdue invoice, how late it is, and how this particular customer has paid in the past. A reliable customer who is two weeks late needs a gentle nudge. A customer who has never paid on time needs a call.",
     "You see the total owed, the likelihood of collecting it, and a ready-to-send reminder &mdash; instead of a list in a spreadsheet you have to remember to open."],
    ("Overdue is a date, not a feeling.", [
        "An invoice is flagged once it is <strong>14 days</strong> past its due date (adjustable).",
        "Each invoice carries a collection likelihood (high, moderate or low) based on how late it is and the customer's own on-time payment history.",
        "The recommended action changes with that history: a soft reminder for customers who usually pay, &ldquo;call the customer directly&rdquo; for those who usually don't.",
        "When the invoice is marked paid in your software, the flag clears and the amount is counted as recovered.",
        "Professional can add a payment link to the reminder through Stripe Connect &mdash; the money goes straight to your own Stripe account, never through Perch&eacute;.",
    ]),
    [("Past-due dollars in one place", "Everything overdue, oldest and largest first, with the exact number of days late.", None, "&#128197;"),
     ("The right nudge for the right customer", "A reminder or a call, based on history rather than guesswork.", None, "&#9742;"),
     ("Optional pay-now link", "Professional reminders can include a Stripe payment link so the customer can pay in a tap.", None, "&#128179;")],
    [("Sync your invoices", "From your field service software or a spreadsheet."),
     ("Overdue ones get flagged", "Each with days late and collection likelihood."),
     ("Send the reminder", "One click by email; text on Professional."),
     ("See it get paid", "Paid invoices are tracked as recovered, with whether a reminder went out first.")],
    [("Unpaid invoice", "red", "red-bg", "27 days past due", "AC tune-up + repair", "$610"),
     ("Unpaid invoice", "red", "red-bg", "Customer usually pays late &mdash; call", "Duct repair", "$1,180")],
    "<strong>What we won't do:</strong> Perch&eacute; never holds or moves your customers' money. Card payments, when enabled, go from your customer to your own Stripe account. And a recovered invoice only counts toward Perch&eacute;'s ROI figure if a follow-up was actually sent before it was paid.",
    [("Can Perch&eacute; collect the payment for me?", "It can include a Stripe payment link in the reminder on Professional. The funds go directly to your connected Stripe account."),
     ("Does it handle partial payments or voids?", "Spreadsheet and inbound-API imports recognize partial payments and skip voided or cancelled invoices instead of counting them as owed."),
     ("What counts as &ldquo;recovered&rdquo;?", "An invoice that moves from unpaid to paid. It's credited to Perch&eacute; only when a follow-up was sent before the payment arrived."),
     ("Can I change when an invoice is flagged?", "Yes &mdash; the days-past-due threshold is a setting.")],
    rel("Cold Estimates", "Lapsed Customers", "Maintenance Plans")))

PAGES.append(solution_page(
    "lapsed-customers", "LAPSED CUSTOMERS",
    "The customers who <span class=\"accent\">quietly stopped calling</span>",
    "Perch&eacute; finds past customers overdue for their next maintenance visit, so you can book them before a competitor does.",
    ["A customer who had a tune-up every spring for three years and then didn't call this year hasn't announced anything. They're just gone &mdash; to a competitor's postcard, a neighbor's recommendation, or plain forgetfulness.",
     "That is the cheapest revenue in the business to win back: they already know and trust you, and there is no ad spend. But nobody is watching for the gap.",
     "Perch&eacute; looks at each customer's maintenance history and flags the ones who've gone past the interval you set."],
    ("A gap in the calendar, spotted automatically.", [
        "A customer with maintenance history who hasn't had a maintenance visit in <strong>12 months</strong> is flagged (adjustable).",
        "Only genuine maintenance visits count &mdash; a one-off repair doesn't make someone a maintenance customer.",
        "The reason shows the real number of months since their last visit.",
        "Professional also totals the recurring revenue currently at risk across all lapsed maintenance customers.",
    ]),
    [("A list of people worth a call", "Past customers who are due, ordered by how long it's been.", None, "&#128222;"),
     ("A renewal offer ready to send", "A friendly &ldquo;it's been a while&rdquo; message, one click.", None, "&#9993;"),
     ("Recurring revenue at risk", "On Professional, a single number for the maintenance revenue slipping away.", None, "&#128200;")],
    [("Read service history", "Perch&eacute; checks completed maintenance visits per customer."),
     ("Flag the gaps", "Anyone past your interval is listed."),
     ("Reach out", "Send the renewal message by email (or text on Professional)."),
     ("Track the rebooking", "Rebooked customers clear from the list and count toward recovered revenue.")],
    [("Lapsed customer", "green", "green-bg", "14 months since last visit", "Due for annual maintenance", "$220")],
    "<strong>Heads up:</strong> this category needs service history. A brand-new business, or a spreadsheet with no past visits, will show little here at first. The value grows as your history does.",
    [("What counts as a maintenance visit?", "Visits recorded as maintenance. In spreadsheet imports, words like &ldquo;maintenance&rdquo;, &ldquo;preventive&rdquo; or &ldquo;service plan&rdquo; are recognized; a one-off &ldquo;tune-up&rdquo; is deliberately not assumed to mean a plan."),
     ("Does it work outside HVAC?", "Yes, anywhere customers return on a schedule &mdash; plumbing inspections, electrical safety checks, and similar. HVAC is where we've focused first."),
     ("Can I change the 12-month window?", "Yes, it's a setting.")],
    rel("Maintenance Plans", "Cold Estimates", "Reputation")))

PAGES.append(solution_page(
    "cold-leads", "COLD LEADS",
    "Every inquiry deserves an <span class=\"accent\">answer while it's still warm</span>",
    "Perch&eacute; tracks new leads from your ads, website and software, shows how fast you respond, and flags the ones going cold.",
    ["A homeowner whose AC just died fills out a form at 9 p.m. If nobody replies for two days, they've already hired someone else. The ad dollars spent to get that lead are gone too.",
     "Perch&eacute; keeps your leads in one list, timestamps your first response, and flags new inquiries that nobody has touched. You also see which sources actually produce jobs.",
     "Bring leads in by uploading a Facebook or Instagram lead-ad export, adding them by hand, syncing Jobber requests, or pushing them through our inbound API from tools like Zapier."],
    ("Speed and silence, measured honestly.", [
        "A lead still marked new, or contacted but quiet, for <strong>3 days</strong> is flagged (adjustable).",
        "Speed-to-lead shows your median response time and the share answered within an hour &mdash; timed only from responses made in Perch&eacute;, never guessed.",
        "A source table shows leads, wins, losses and win rate among closed leads for each source, so open leads aren't counted as losses.",
        "Leads are kept separate from the main &ldquo;revenue at risk&rdquo; total because an inquiry isn't revenue you've earned yet.",
    ]),
    [("One list for every source", "Website, Facebook, Instagram, Jobber requests, phone calls you log yourself.", None, "&#128229;"),
     ("Response-time stats", "Median reply time, answered-within-an-hour, who's still waiting and for how long.", None, "&#9201;"),
     ("Which source actually works", "Win rate by source, using closed leads only.", None, "&#128202;")],
    [("Get leads in", "Upload an export, add by hand, sync from your software or use the API."),
     ("Watch the clock", "New leads show how long they've waited."),
     ("Reply fast", "Mark contacted or send a follow-up; the first response is timestamped."),
     ("Learn what converts", "Compare sources by wins and losses.")],
    [("Cold lead", "amber", "amber-bg", "New &mdash; waiting 3 days for a reply", "Facebook lead &middot; AC not cooling", "Open")],
    "<strong>Where live sync stands:</strong> a direct, automatic connection to Meta lead ads is built but switched off until Meta approves our app, which takes weeks. Until then, upload your lead-ad export or use the inbound API. We'll say so on the Integrations page the day it changes.",
    [("Does it connect to Meta lead ads directly?", "Not yet live &mdash; it's built and waiting on Meta's app review. Today you can upload the export from Ads Manager."),
     ("How is response time measured?", "From when the lead was created to the first time it leaves &ldquo;new&rdquo; in Perch&eacute; or a follow-up is sent. Leads handled elsewhere are counted separately, not guessed."),
     ("Can Perch&eacute; text or email a new lead automatically?", "No. Follow-ups are a click you control.")],
    rel("Cold Estimates", "Reputation", "Maintenance Plans")))

PAGES.append(solution_page(
    "reputation", "REPUTATION",
    "Reviews are <span class=\"accent\">revenue you can see</span>",
    "Perch&eacute; shows which reviews nobody has answered, drafts a reply for you to post, and helps you ask happy customers for more.",
    ["Before anyone calls you, they read your reviews. An unanswered one-star review sits there telling every prospect you don't respond. A steady stream of recent five-star reviews does the opposite.",
     "Perch&eacute; keeps your reviews in one place, highlights the ones that need a reply &mdash; low ratings first &mdash; and suggests wording so replying takes a minute.",
     "It also finds customers who paid recently and are good people to ask for a review, and leaves out anyone who still owes you money."],
    ("Counts and next steps &mdash; not made-up dollar values.", [
        "Reviews are added by hand, by CSV upload from your review export, or (once approved) pulled from Google automatically.",
        "Unanswered reviews are listed with low ratings (3 stars or less) first, then oldest first.",
        "&ldquo;Suggest reply&rdquo; gives you wording to copy. Perch&eacute; never posts anything for you.",
        "Review requests go to customers who paid 2&ndash;30 days ago, have an email on file, haven't been asked in 180 days, and have no overdue invoice. You send each one yourself.",
        "We don't invent a dollar figure for a review. Reputation shows counts, reply rate and average rating.",
    ]),
    [("An unanswered-reviews inbox", "Everything that needs a reply, most urgent first.", None, "&#9733;"),
     ("Suggested replies", "Warm, plain wording that never promises refunds or discounts. Copy and post it yourself.", None, "&#9998;"),
     ("Ask the right customers", "A short list of recently-paid customers, one click per request, with your Google review link.", None, "&#128172;")],
    [("Bring reviews in", "Add them, upload a CSV, or connect Google when approved."),
     ("See what needs a reply", "Low ratings first."),
     ("Reply in a minute", "Use the suggestion, post it on Google or Facebook."),
     ("Ask for more", "Send review requests to recently-paid customers.")],
    [("Review", "red", "red-bg", "1 star &middot; unanswered 6 days", "&ldquo;Never called back about the quote&rdquo;", "Reply")],
    "<strong>Where live sync stands:</strong> a direct Google Business Profile connection is built, but Google must approve our access first. Until then you can add or upload reviews. Perch&eacute; will never reply to a review, or ask for one, without your click.",
    [("Will Perch&eacute; post replies for me?", "No. It gives you suggested wording; you post it."),
     ("Can it remove or hide bad reviews?", "No, and nothing legitimate can. The best response to a bad review is a prompt, professional reply."),
     ("How does it pick who to ask for a review?", "Customers with an invoice paid 2&ndash;30 days ago, an email on file, no request in the last 180 days, and no overdue invoice.")],
    rel("Cold Leads", "Lapsed Customers", "Unpaid Invoices")))

PAGES.append(solution_page(
    "maintenance-plans", "MAINTENANCE PLANS",
    "Recurring revenue is the <span class=\"accent\">calmest money</span> in your business",
    "Perch&eacute; tracks maintenance contracts coming up for renewal and finds happy customers who were never offered a plan.",
    ["A maintenance plan turns a one-time job into a relationship. It smooths out the seasonal swings and gives your techs a reason to be in the house before something breaks.",
     "Two things go wrong. Existing plans quietly expire because nobody's watching the renewal dates. And customers who have paid you for real work have never actually been asked to join a plan.",
     "Perch&eacute; handles both: it tracks contract renewals, and it lists customers with completed paid work who've never been on a plan."],
    ("Renewals and opportunities, kept honest.", [
        "Contracts you enter (or that Perch&eacute; suggests from recurring service history) are tracked with their renewal dates.",
        "Renewals within <strong>45 days</strong>, and any past due, are flagged; a contract past its renewal date with no action is marked lapsed automatically.",
        "Upsell candidates are real customers with completed, paid jobs at least 30 days into the relationship who've never had a maintenance plan.",
        "An upsell is valued at <em>your own</em> average annualized plan value &mdash; never an industry number &mdash; and kept out of the revenue-at-risk total, because it's new revenue, not recovered revenue.",
    ]),
    [("Never miss a renewal", "Upcoming and overdue renewals in one list.", None, "&#128260;"),
     ("Plan-pitch list", "Customers worth offering a plan to, with the history that makes them a fit.", None, "&#127919;"),
     ("Recurring revenue at risk", "A portfolio view of maintenance revenue slipping away (Professional).", None, "&#128200;")],
    [("Track your contracts", "Add them or accept Perch&eacute;'s suggestions from service history."),
     ("See what's due", "Renewals within 45 days and lapsed contracts."),
     ("Make the offer", "Send the renewal or plan pitch."),
     ("Measure it", "Renewed contracts and signed plans show up in your results.")],
    [("Expiring contract", "amber", "amber-bg", "Renews in 21 days", "Annual HVAC maintenance plan", "$360"),
     ("Plan opportunity", "green", "green-bg", "Paid customer, never on a plan", "Two completed jobs", "$290")],
    "<strong>Plan features are part of Professional.</strong> Contract tracking, upsell detection and the recurring-revenue-at-risk view are included in the $599 plan; Starter covers cold estimates, unpaid invoices and lapsed customers.",
    [("Is an upsell the same as recovered revenue?", "No. We label it new revenue and keep it out of the recovered total on purpose."),
     ("Where does the plan value come from?", "From your own average annualized plan value. If you have none yet, we say so rather than guess."),
     ("Can Perch&eacute; write the plan agreement?", "No. It surfaces who to talk to and when; the terms are yours.")],
    rel("Lapsed Customers", "Cold Estimates", "Reputation")))
