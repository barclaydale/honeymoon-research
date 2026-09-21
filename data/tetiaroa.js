HM.addIsland({
  id: "tetiaroa",
  name: "Tetiaroa",
  group: "Society Islands · Windward",
  cost: 4,
  vibe: "Secluded",
  pace: "Chill",
  terrain: "Atoll",
  scores: [5, 2, 4, 3],
  tagline: "Marlon Brando's private atoll, all to yourselves",
  short: "A ring of twelve tiny islets 53 km north of Tahiti, bought by Marlon Brando in 1966 and now home to one eco-resort, The Brando, and a research station. A 20-minute private flight from Papeete drops you into a world of turtles, terns and total privacy.",
  unique: "Tetiaroa is the only island in this collection with exactly one place to stay, and you cannot visit without booking it: the atoll is private, so there are no day trippers and no other hotels. Unlike Bora Bora's resort-lined lagoon, everything here (meals, drinks, guided excursions, a daily spa treatment) is folded into one very high nightly rate, and the conservation work of the Tetiaroa Society is part of the experience. It is the most exclusive, and the most expensive, honeymoon in French Polynesia.",
  palette: ["#F4B590", "#FFF1D6", "#6BA57A", "#37C8B8"],
  scene: "atoll",
  transfer: 20,
  meta: {
    population: "No permanent residents (resort and Tetiaroa Society staff only)",
    area: "≈ 6 km² of land across 12 motu; lagoon ≈ 7 km wide",
    highest: "≈ 3 m above sea level",
    languages: "French and Tahitian among staff; English is standard at The Brando",
    timezone: "UTC−10 (no daylight saving)",
    nights: "3–5",
    bestTime: "May–October is the driest and coolest season. Humpback whales pass in August–October, and green sea turtles nest and hatch seasonally (ask the resort what is happening on your dates). November–April is warmer, more humid and more likely to have rain.",
    gettingThere: "Guests only: Air Tetiaroa flies ≈ 20 min from Papeete-Faa'a to the Onetahi airstrip, with departures typically at 8:30 am and 2:00 pm. Return transfers are separate from the villa rate (one guest review quoted about €612 round-trip; expect several hundred dollars per person), so confirm when you book.",
    gettingAround: "By bicycle, on foot and by resort boat. Onetahi is small and flat: every guest is given a bike on arrival, and excursion boats leave from the resort beach to the other motu.",
    dailyBudget: "Villas from roughly $3,300–4,500/night B&B, or $5,500–7,000+/night on the all-inclusive rate (meals, drinks, daily excursions and one spa treatment a day). Laundry, premium wines, diving, fishing and private excursions are extra.",
    bestFor: ["Once-in-a-lifetime honeymoons", "Privacy-seekers", "Nature and conservation lovers", "Stargazing and total quiet"],
    skipIf: ["You want to explore multiple islands on a budget", "You prefer a lively hotel scene and independent restaurant choices", "You are uncomfortable with a rate that runs to several thousand dollars a night"],
    goodToKnow: [
      "The Brando is the only lodging: every booking, transfer and excursion goes through the resort, and the atoll cannot be visited independently.",
      "Ask which excursions are included: most shared guided tours and cultural sessions are, while diving, deep-sea fishing, whale swims, laundry and private charters usually carry extra fees.",
      "Only two flights a day bring guests, so a delay in Papeete can cost you a night. Build a buffer day around your international flights.",
      "Turtle nesting and seabird activity are seasonal. Tell the concierge on arrival what you most want to see."
    ]
  },
  act: [
    ["Tetiaroa Society Ecostation & Green Tour", "A 1.5-hour walk around the Tetiaroa Society's research station on Onetahi and the resort's sustainability systems: solar panels, seawater air-conditioning (SWAC), organic gardens and the science labs where researchers study coral reefs, ocean acidification and native plants. Included in your Brando rate, and a good rainy-day option.", "culture wildlife relax", "C", 4, 0, 1.5, 0, "u:https://www.tetiaroasociety.org/facilities/ecostation"],
    ["Green sea turtle nesting & hatchling programme", "Green turtles nest on the atoll's motu, and Tetiaroa Society teams with local groups Te Mana o Te Moana and Te Manu to count tracks and protect nests: in 2024-25 they recorded about 161 nests and over 15,000 hatchlings. Seasonal and weather-dependent, so ask the naturalists what is happening on your dates. Included in your Brando rate; the naturalists can tell you if a nest is close to hatching.", "wildlife relax", "U", 3, 0, 2, 0, "u:https://www.tetiaroasociety.org/programs/conservation/bird-and-green-turtle-sanctuary"],
    ["Bird Discovery Tour (bird motu incl. Reiono)", "A 2-hour boat trip to protected bird motu, where you see up to seven seabird species: white terns, brown noddies, grey-backed terns, red-footed boobies and egrets nest in the trees and brush. Rats have been eradicated from islets such as Reiono, so the colonies are thriving. Best in the morning; bring binoculars and a hat. Included in your Brando rate.", "wildlife boat scenic", "C", 4, 0, 2, 0, "u:https://thebrando.com/experiences/"],
    ["Reef Quest snorkelling", "A 2-hour boat and snorkel excursion to the barrier reef: coral gardens, reef sharks, stingrays and turtles, with a guide on hand. Minimum age 12 and you should be a confident swimmer. Choose a calm day; included in your Brando rate.", "snorkel wildlife boat", "C", 5, 0, 2, 0, "u:https://thebrando.com/experiences/"],
    ["Outrigger canoe & kayak lagoon paddle", "A 2.5-hour guided kayak excursion through the passes between motu, watching the coastal ecosystems, plus outrigger canoe and stand-up paddle boards available from the beach at any time. Included in your Brando rate; go early, before the trade winds pick up.", "water relax scenic", "U", 3, 0, 2.5, 0, "u:https://thebrando.com/experiences/"],
    ["Onetahi archaeology & Brando history by bike", "A 1.5-hour bicycle tour of Onetahi to Polynesian ritual sites and the remnants of Brando's original 1970 village of coconut-wood bungalows and shell-sink bathrooms, with stories about the Tahitian chiefs and the ariori. Included in your Brando rate; you are given a bike on arrival.", "history culture bike", "C", 4, 0, 1.5, 0, "u:https://en.wikipedia.org/wiki/Tetiaroa"],
    ["Rimatu'u excursion (Brando's private motu)", "A 2.5-hour boat trip to Rimatu'u, Marlon Brando's former private motu, with sacred sites, quiet lagoons and an ornithology reserve where birds nest. Minimum age 12 and confident swimming; included in your Brando rate. One of the more atmospheric half-days, and rarely crowded.", "history wildlife boat", "H", 2, 0, 2.5, 10, "u:https://thebrando.com/experiences/"],
    ["Varua Te Ora Polynesian spa", "The Brando's spa uses Polynesian rituals, steam and couples' treatment suites. Your rate includes one 50-minute treatment per bedroom per day; extra treatments are charged. Book the late afternoon slot, after the reef trips.", "wellness relax romance", "C", 5, 0, 1, 0, "u:https://thebrando.com/experiences/"],
    ["Polynesian culture sessions", "Short 30-minute workshops: traditional dance with guest participation, pareu tie-dye, palm-frond weaving, ukulele, pahu drum and to'ere lessons, and introductory Tahitian language. Fun, unhurried and included in your Brando rate.", "culture local relax", "U", 3, 0, 0.5, 0, "u:https://thebrando.com/experiences/"],
    ["Custom motu picnic & castaway lunch", "The resort will design a private excursion that ends on a secluded beach with a picnic, a hammock and no one else in sight. Shared guided excursions are included in the rate, but a fully private boat or chef may carry a surcharge, so ask the concierge before you plan. Best with a morning departure and a full day of nothing after.", "romance beach food boat", "U", 4, 0, 4, 0, "u:https://thebrando.com/experiences/"],
    ["Humpback whale swim (Aug-Oct)", "A 3-hour private expedition to watch humpback whales and, when conditions allow, slip into the water with them; minimum age 12 and strong swimmers only. Whales pass August-October, and this is an extra, not part of the daily excursions, so ask the resort for the current price and book early.", "wildlife boat adventure", "U", 2, 250, 3, 10, "u:https://thebrando.com/experiences/"],
    ["Diving & deep-sea fishing (extra)", "Private expeditions beyond the included programme: one or two dives on the outer reef for certified divers (2-4 hours) or trolling for game fish beyond the reef with an expert crew. These are surcharged; the price here is a rough guess, so ask the resort for current rates. Best when the lagoon is calm.", "dive adventure boat", "U", 2, 200, 3, 10, "u:https://thebrando.com/experiences/"],
    ["Beach cinema & secluded dinners under the stars", "The resort can set up a movie on the beach or a private dinner on a secluded motu, at the concierge's discretion. With no city lights for kilometres, the night sky is the main event: look for the Southern Cross and the Milky Way. Ask well in advance; extra charges may apply.", "romance night relax", "H", 3, 0, 2.5, 0, "u:https://thebrando.com/"]
  ],
  stay: [
    ["The Brando: One Bedroom Villa", "Private island", "The entry villa (24 of them, ≈ 1,030 sq ft) with a private plunge pool and terrace steps from the beach. The rate shown is the all-inclusive rate for two, with all meals and drinks, 24-hour room service, shared daily excursions and one spa treatment a day. Promotions often cut 15-30%, and B&B-only rates run around $3,300-4,500.", "beachfront pool spa allinc secluded", 5800, "u:https://thebrando.com/", "Onetahi motu", "Only lodging on Tetiaroa. Rates approximate: confirm with The Brando."],
    ["The Brando: One Bedroom Villa Turtle Beach", "Private island", "One of six Turtle Beach villas (≈ 1,030 sq ft) in the beachfront category, with the same plunge pool and inclusions as the standard villa. Aimed at families but equally private for couples; expect a rate slightly above the standard one-bedroom.", "beachfront pool spa allinc secluded", 6200, "u:https://www.tahiti.com/hotels/the-brando-3455", "Onetahi motu", "Rate is an estimate. All bookings go through The Brando."],
    ["The Brando: Two Bedroom Villa", "Private island", "Four two-bedroom villas (≈ 1,808 sq ft) with a larger pool and a second suite, good for a honeymoon plus friends or family. Rate shown is a rough estimate for the all-inclusive package (roughly double the one-bedroom); a single three-bedroom villa and a private residence sit above this.", "beachfront pool spa allinc secluded", 10500, "u:https://thebrando.com/", "Onetahi motu", "Rate is an estimate; confirm with The Brando."]
  ]
});
