/*
  TraceQuote settings.
  Everything a client setup changes lives in this one file:
  names, links, the map key, the price sheet, product details and financing terms.
*/
window.TQ_CONFIG = {
  productName: "TraceQuote",
  companyLegal: "Perché AI Solutions LLC",
  companyAddress: "1100 S Miami Ave, Miami, FL 33130",
  contactEmail: "hello@perchesolutions.com",

  // "Book a call" buttons on the site open this Calendly page.
  bookingUrl: "https://calendly.com/perchesolutions/free-worldflow-audit",

  // Live satellite map and address search.
  // Paste your Mapbox "Default public token" (it starts with "pk.").
  // Leave it empty and the quote tool runs on the illustrated example home instead.
  mapboxToken: "",
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v12",
  mapCenter: [-80.1918, 25.7617], // address search favors results near here (Miami)
  searchCountry: "us",
  mapHomeZoom: 19.5,              // how close the map zooms in to a home
  minDrawZoom: 17,                // homeowners must zoom in at least this far to draw

  // The made-up company shown in the demo. Swap for a client's details at setup.
  demoCompany: {
    name: "Demo Fence Co.",
    site: "yourfencecompany.com/instant-quote",
    phone: "(305) 555-0142"
  },

  // Monthly payment estimate shown next to each price. Set by the contractor's lender.
  financing: {
    show: true,
    apr: 9.99,
    months: 120,
    note: "Example terms. The contractor's lender sets the actual rate, term and approval."
  },

  // Asked on the details step so the contractor knows how hot the lead is.
  timingOptions: ["As soon as possible", "In 1 to 3 months", "Just planning"],

  // Sample price sheet and product details. Every number and note here is the contractor's to set.
  pricing: {
    materials: [
      {
        id: "chain",
        name: "Chain link",
        note: "Galvanized steel",
        tier: "Budget",
        swatch: "chain",
        heights: { "4": [12, 18], "6": [16, 24] },
        defaultHeight: "4",
        colors: [{ name: "Galvanized", hex: "#9aa3a0" }, { name: "Black coated", hex: "#2a2f2d" }, { name: "Green coated", hex: "#355e3b" }],
        details: { lifespan: "15 to 20 years", upkeep: "Very low", privacy: "See-through" }
      },
      {
        id: "wood",
        name: "Wood privacy",
        note: "Pressure-treated pine",
        tier: "Classic",
        swatch: "wood",
        heights: { "6": [24, 34], "8": [32, 44] },
        defaultHeight: "6",
        colors: [{ name: "Natural", hex: "#c79a6b" }, { name: "Cedar stain", hex: "#a5603a" }, { name: "Gray stain", hex: "#8b8a83" }],
        details: { lifespan: "15 to 20 years", upkeep: "Stain or seal every 2 to 3 years", privacy: "Full privacy" }
      },
      {
        id: "vinyl",
        name: "Vinyl privacy",
        note: "PVC panels",
        tier: "Most popular",
        swatch: "vinyl",
        heights: { "4": [24, 32], "6": [34, 46] },
        defaultHeight: "6",
        colors: [{ name: "White", hex: "#f3f1ea" }, { name: "Tan", hex: "#d8c7a4" }, { name: "Gray", hex: "#a9aba8" }],
        details: { lifespan: "20 to 30 years", upkeep: "Wash as needed", privacy: "Full privacy" }
      },
      {
        id: "aluminum",
        name: "Aluminum",
        note: "Ornamental pickets",
        tier: "Premium look",
        swatch: "aluminum",
        heights: { "4": [30, 40], "5": [34, 46] },
        defaultHeight: "4",
        colors: [{ name: "Black", hex: "#1f2325" }, { name: "Bronze", hex: "#5a4636" }, { name: "White", hex: "#eceeec" }],
        details: { lifespan: "20 years or more", upkeep: "Very low, won't rust", privacy: "Open view, common around pools" }
      }
    ],
    defaultMaterial: "vinyl",
    gates: {
      walk: { label: "Walk gate", width: 4, price: [450, 750] },
      drive: { label: "Drive gate", width: 12, price: [1400, 2600] }
    },
    removalPerFt: [2, 4],
    minimumJob: 1500,
    roundTo: 50,
    postSpacingFt: 8
  }
};
