/* REFERENCE ONLY (not loaded by the site; underscore files are skipped by the validator).
   Shows the exact format and voice. Real files should have 12-18 activities and 4-7 stays. */
HM.addIsland({
  id: "moorea",
  name: "Moorea",
  group: "Society Islands · Windward",
  cost: 2,
  vibe: "Balanced",
  pace: "Mixed",
  terrain: "High island",
  scores: [4, 4, 4, 3],
  tagline: "Jagged peaks, pineapples and a 30-minute ferry",
  short: "Tahiti's dramatic little sister: a heart-shaped volcanic island ringed by a lagoon, with two deep bays, pineapple-covered valleys and real hiking. Close enough to reach by ferry, wild enough to feel like a proper escape.",
  unique: "Moorea is the only honeymoon island you can reach by a 30-minute ferry, so no flight is needed and it stays cheaper than the Leeward islands. Unlike Bora Bora it has genuine interior to explore (hikes, 4x4 valleys, ancient marae), and it has the best whale and ray encounters within easy reach of Papeete.",
  palette: ["#8CC3E0", "#FCE3BE", "#2F6B4F", "#22B0AA"],
  scene: "peaks",
  transfer: 30,
  meta: {
    population: "≈ 18,000 (2022 census, incl. Maiao)",
    area: "134 km²",
    highest: "Mont Tohiea, 1,207 m",
    languages: "French (official), Tahitian; English widely spoken at resorts and tour operators",
    timezone: "UTC−10 (no daylight saving)",
    nights: "3–5",
    bestTime: "May–October is driest and least humid; July–November brings humpback whales. Nov–April is hotter, wetter and greener, with lower prices.",
    gettingThere: "From Papeete: fast ferry (Aremiti or Terevau) 30–45 min, ≈ $14 one-way, many sailings a day; or a 7-minute Air Tahiti hop (≈ $60).",
    gettingAround: "Rent a car or scooter at the ferry dock; the 60 km coast road loops the island. Taxis are expensive and there is only a basic bus.",
    dailyBudget: "Mid-range hotels $250–450/night; dinners $60–110 for two; guided tours $70–150 per person.",
    bestFor: ["First-time honeymooners", "Hiking + beach combo", "Whale season", "Budget-flexible trips"],
    skipIf: ["You want over-the-water bungalows with Instagram lagoon views", "You dislike renting a car"],
    goodToKnow: [
      "Book the ferry-side rental car before you arrive, as they sell out in high season.",
      "Best sunset lagoon views are on the west coast around Hauru Point.",
      "Many restaurants close by 8:30 pm; reserve for dinner."
    ]
  },
  act: [
    ["Belvédère Lookout & Opunohu Valley 4x4", "Bounce up through pineapple fields and ancient marae to the Belvédère, a 360° viewpoint over Cook's Bay, Opunohu Bay and Mount Rotui. Go in the morning before clouds gather on the peaks; guided 4x4 tours add history and a stop at the archery platforms.", "scenic adventure history", "C", 5, 80, 3.5, 20, "tt:islands/moorea/what-to-do-in-moorea/"],
    ["Humpback whale swim & watch", "From July to November, humpbacks calve and breed in the deep water off Moorea. Operators with licensed guides let you watch from the boat and, when the whales allow it, slip in for a quiet in-water encounter. Choose small groups and operators who follow the local whale-approach rules.", "wildlife boat", "C", 5, 140, 3.5, 20, "t:Moorea whale watching"],
    ["Afareaitu waterfalls", "A shady walk from the village of Afareaitu to a set of cascades and cool swimming pools. Locals come here on weekends. Wear shoes that can get wet.", "hike local", "H", 2, 0, 2.5, 25, "w:Afareaitu"],
    ["Papetoai octagonal temple", "A tiny octagonal church built in 1822 on the site of an ancient marae, considered the oldest European building still in use in the South Pacific. Ten minutes to visit, then swim at the beach across the road.", "history culture", "H", 1, 0, 0.75, 20, "w:Papetoai"]
  ],
  stay: [
    ["Hotel Les Tipaniers", "Pension", "Family-run bungalows and garden rooms on Hauru Point with its own restaurant and lagoon beach. Rates are for a garden bungalow. Simple, friendly, great value on Moorea.", "beachfront local", 190, "t:Hotel Les Tipaniers Moorea", "Hauru Point"],
    ["Manava Beach Resort & Spa Moorea", "Beach resort", "Full-service beachfront resort on the sunset side with pool, spa, and a house reef. Rate is for a garden bungalow; overwater bungalows sit around $600+.", "beachfront pool spa reef", 380, "t:Manava Beach Resort Moorea", "Maharepa / Hauru", "Confirm current room categories."]
  ]
});
