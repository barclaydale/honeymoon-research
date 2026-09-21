HM.addIsland({
  id: "tikehau",
  name: "Tikehau",
  group: "Tuamotu Islands",
  cost: 3,
  vibe: "Off the beaten path",
  pace: "Chill",
  terrain: "Atoll",
  scores: [4, 3, 5, 2],
  tagline: "A small pink-sand ring made for slow days",
  short: "A compact, intimate atoll 55 minutes from Tahiti, ringed by pink-tinged beaches and shallow, fish-rich water. Manta rays feed at the old pearl farm, seabirds nest on Bird Island and one village, Tuherahera, holds nearly everyone.",
  unique: "Tikehau is the Tuamotu for a honeymoon that is more about lagoon than adrenaline: the lagoon is small (about 27 × 19 km) so everything is a short boat ride away, the only overwater bungalows are at one resort, and the marquee wildlife (manta rays) is a shallow snorkel rather than a technical dive. Compared with Rangiroa it is smaller, quieter and pinker; compared with Fakarava it is less remote and much easier on non-divers.",
  palette: ["#F2A77F", "#FFE9C9", "#5F9E6E", "#2FC5B8"],
  scene: "atoll",
  transfer: 20,
  meta: {
    population: "≈ 530 (2012 census), nearly all in Tuherahera village",
    area: "Lagoon ≈ 461 km²; atoll ≈ 27 km × 19 km",
    highest: "≈ 8 m above sea level",
    languages: "French (official), Tahitian and Paumotu; English at Le Tikehau and dive centres, patchy in pensions",
    timezone: "UTC−10 (no daylight saving; 2 h behind US Pacific in summer)",
    nights: "3–5",
    bestTime: "Year-round for mantas, which visit the cleaning station most mornings but sometimes vanish for a day or two. May–October is drier and cooler; the cold months also bring hammerheads to the Tuheiava Pass. November–April is hotter, wetter and calmer.",
    gettingThere: "From Papeete: Air Tahiti, about 55 min, ≈ $220 one-way, most days; a few weekly hops from Rangiroa (≈ 20 min). From the airstrip a boat (5–30 min depending on the lodging) or a pension van takes you to your lodging; Le Tikehau's boat crossing is about 10–15 minutes.",
    gettingAround: "Bicycles, kayaks and paddleboards are free at most pensions; distances are tiny. Everything beyond the village (mantas, Bird Island, pink sand, the pass) needs a boat, which your lodging or a dive centre arranges.",
    dailyBudget: "Pensions on half board ≈ $220–330/night for two; Le Tikehau overwater ≈ $800+; a full-day lagoon tour ≈ $100–125 per person; manta snorkel ≈ $85; dives ≈ $95 each; dinners in pensions are included.",
    bestFor: ["Manta snorkeling", "Pink-sand romance", "Quiet honeymoons with light activity", "Combining with Rangiroa or Fakarava"],
    skipIf: ["You want nightlife or shopping", "You want a lush mountain island", "You need reliable English everywhere"],
    goodToKnow: [
      "Le Tikehau by Pearl Resorts is the atoll's only overwater resort; its 21 overwater units and 8 beach bungalows sit on a pink beach at the south-east, 10–15 min by boat from the village.",
      "There is a single bakery near Tuherahera: pre-order in the morning and collect between 3 and 5 pm; a loaf costs pennies.",
      "The pink-sand beaches have zero shade: bring sunscreen, a hat, water and a pareo.",
      "Flight schedules are thin, so pair Tikehau with Rangiroa (20 min hop) rather than expecting daily options."
    ]
  },
  act: [
    ["Manta ray snorkel at the old pearl farm", "About five minutes by boat from the village or Le Tikehau, an abandoned pearl farm has become a cleaning station: reef mantas with 3–4 m wingspans glide around you in shallow, clear water, shadowed by small cleaner fish. Mornings are best and sightings are common but never guaranteed; go with an operator that keeps a respectful distance.", "snorkel wildlife romance", "C", 5, 85, 1.5, 10, "th:island/tikehau"],
    ["Bird Island (Motu Puarua)", "A tiny motu in the north-east of the lagoon that is a natural aviary: brown noddies, red-footed boobies, white terns, crested terns and frigatebirds nest in the low scrub. Boats keep to the shore to avoid disturbing the colonies; go with a guide, and bring binoculars and a hat.", "wildlife boat scenic", "C", 4, 105, 2, 15, "t:Tikehau Bird Island Motu Puarua"],
    ["Full-day lagoon tour with fishermen's picnic", "The classic Tikehau day: manta snorkel in the morning, a drift through the Tuheiava Pass, Bird Island, a coral garden stop and a grilled-fish lunch at a fishermen's motu with a private beach. Pensions such as Hotu charge about 12,000 XPF per adult; Hititemanava and others run similar trips. Wear a rash guard, since there is little shade.", "boat snorkel food beach", "C", 5, 100, 7, 10, "t:Tikehau lagoon tour"],
    ["Les Sables Roses pink-sand beaches", "The atoll's south-east and eastern shores have sandbars and beaches tinted rose by crushed red coral. Best in the morning for soft light and in late afternoon for sunset; there is no shade and no facilities. Le Tikehau sits on one of these beaches; pensions include a stop on their boat trips or sell a picnic.", "beach romance scenic relax", "C", 5, 0, 3, 20, "u:https://www.lonelyplanet.com/tahiti-and-french-polynesia/tuamotu-islands/tikehau/attractions/les-sables-roses/a/poi-sig/1434510/362958"],
    ["Tuheiava Pass dive", "Tikehau's only pass is where the drama is: barracuda and trevally in walls, grey reef and, in the cooler months, hammerhead and tiger sharks, leopard rays and napoleon wrasse. Coco Dive and Raie Manta Diving run small groups; two dives cost about 19,000 XPF and manta rays in the lagoon can be dived at 10,000 XPF.", "dive wildlife adventure", "C", 3, 95, 2.5, 10, "u:https://www.cocodivetikehau.com/en/"],
    ["Tuheiava Pass drift & coral garden snorkel", "A four-hour morning snorkel that combines the manta cleaning station, the pass, a dolphin research area and coral garden; you may see sharks and eagle rays. It is the best value for non-divers who want more than the manta stop. Price is an estimate; confirm the operator.", "snorkel wildlife boat", "U", 3, 90, 4, 10, "u:https://raiemantadiving.com/en/snorkeling.html"],
    ["Coconut-oil factory (huilerie)", "A tiny artisan press in the village where oil is made by hand from harvest to pressing, then sold pure or as monoi. Ten to twenty minutes; opening hours are irregular, so ask your pension to check that it is working and to call ahead.", "local shopping culture", "H", 2, 5, 1, 10, "w:Coconut oil"],
    ["Hina's Bell (Cloche de Hina)", "On the ocean side, fossilised coral formations rise over black-rock and clear tidal pools, named for the legendary princess Hina. It is at its best at low tide and sunset; wear sturdy sandals because the rock is sharp, and don't swim in the surf.", "scenic history relax", "H", 2, 0, 1.5, 15, "w:Hina (goddess)"],
    ["Fishermen's dock at dusk (and manta by night)", "Around sunset, pirogues arrive at Tuherahera's dock with tuna, grouper and parrotfish while children fish and play. After dark the dock lights sometimes attract mantas (visitors have counted up to ten in a night). Free, and a lovely way to see daily life.", "local wildlife night", "H", 3, 0, 1, 5, "t:Tikehau Tuherahera dock"],
    ["Sunset paddleboard & kayak", "Most pensions and Le Tikehau include kayaks and paddleboards. Paddle out at golden hour when the lagoon goes pink and gold, with reef fish and rays below and the ocean-side surf audible in the distance. Bring a light layer, as the breeze can be cool.", "water romance relax", "U", 4, 0, 2, 0, "th:island/tikehau"],
    ["Cycle the atoll & Tuherahera village", "The road is flat and short: pedal to Tuherahera to see the colourful houses, the church of Saint-Nicodème, and the bakery and grocery (order bread in the morning, collect after 3 pm), then ride to a deserted beach. Bikes are free at most pensions.", "bike local culture", "U", 4, 5, 2.5, 0, "w:Tikehau"],
    ["Sunset lagoon cruise with champagne", "A private or small-group boat ride at golden hour with champagne and snacks, usually run by the resort or a pension. You cruise the lagoon edge, see the sky turn coral pink and, with luck, spot rays and dolphins. Price is an estimate for a shared cruise.", "boat romance scenic", "U", 3, 80, 2, 10, "th:island/tikehau"],
    ["Introduction to spearfishing & snorkeling", "A small-group morning (maximum six) where a local guide teaches basic breath-hold and spearfishing, then snorkels the coral gardens and the manta site. Your catch can be cooked as a Polynesian meal for an extra fee. Price is an estimate; suits curious couples, not a strict wildlife-viewing trip.", "snorkel adventure local food", "H", 2, 95, 3.5, 10, "u:https://raiemantadiving.com/en/snorkeling.html"],
    ["Sport & lagoon fishing trip", "Tikehau's waters are famously rich in fish, and pensions such as Hotu run big-game trips outside the reef and more relaxed lagoon lines. Half days (about 4 h) are best done early; some crews grill the catch on a motu. Price is an estimate per person on a shared boat.", "boat adventure local", "U", 2, 110, 4, 10, "t:Tikehau fishing"]
  ],
  stay: [
    ["Le Tikehau by Pearl Resorts", "Overwater resort", "The atoll's luxury address: 21 overwater bungalows and suites and 8 beach bungalows on a secluded pink beach 10–15 min by boat from the airport. Two restaurants (Poreho, Te Reka Ika), a bar, a dive centre, and free kayaks and snorkel gear. Rate is for a standard overwater bungalow; the price is an estimate.", "overwater beachfront reef secluded", 850, "u:https://www.letikehau.com/", "South-east shore, 10–15 min by boat", "Rates aren't published; confirm current pricing."],
    ["Pension Herearii", "Pension", "A tiny, well-loved pension on a pink sand beach with only two cabins, famous for the best home cooking on the atoll and an unmissable sunset. About 25,000 XPF for two, half board recommended; book early because there are so few rooms.", "beachfront local secluded allinc", 250, "t:Pension Herearii Tikehau", "Reef-side, near Tuherahera", "Only two cabins, so book well ahead."],
    ["Pension Hotu", "Pension", "Six traditional bungalows with a restaurant (local fish, breakfast and dinner), free bikes, kayaks and paddleboards, and the Coco Dive centre. Half board was 10,500 XPF per person (2021), so the price shown is an estimate for two; excursions and fishing are organised in-house.", "local allinc", 260, "u:https://cocodivetikehau.com/en/the-hotu-pension.html", "Near Tuherahera", "Published rate is dated; confirm."],
    ["Pension Tikehau Village", "Pension", "Eight hand-built bungalows of kahaia wood and pandanus facing a big white beach and turquoise lagoon next to the village, run by Caroline and Paea. Fish-and-garden meals are served on the beach, and beach towels, bicycles, kayaks and a petanque pitch are free.", "beachfront local allinc", 270, "t:Pension Tikehau Village", "Next to Tuherahera village", "Rate is an estimate."],
    ["Pension Tipapa", "Pension", "Three roomy 44 m² units with terraces and fans on the reef side, three minutes by bike from the village. Meals are optional (local food on request), so it is the flexible, self-guided choice with free bikes and shops nearby.", "local secluded", 200, "t:Pension Tipapa Tikehau", "Reef side, near Tuherahera", "Rate is an estimate."]
  ]
});
