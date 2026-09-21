HM.addIsland({
  id: "tahaa",
  name: "Taha'a",
  group: "Society Islands · Leeward",
  cost: 3,
  vibe: "Off the beaten path",
  pace: "Chill",
  terrain: "High island",
  scores: [4, 2, 4, 3],
  tagline: "The Vanilla Island, with Bora Bora on the horizon",
  short: "A flower-shaped island in the same lagoon as Raiatea, known as the Vanilla Island for growing about 80% of French Polynesia's vanilla, plus black pearls, rum and deep bays. It has no airport and no crowds, and a few private-motu resorts look straight across at Bora Bora.",
  unique: "Taha'a is where you go to slow down and eat well. Raiatea next door has the history and the sailing, while Taha'a offers working farms (vanilla, pearls, rum), a coral garden you drift over in the current and motu resorts with Bora Bora views that cost less than their Bora Bora cousins, though never cheap. It is quieter and less developed than every other Society island: no airport, few roads, a handful of guesthouses and roughly 5,300 residents.",
  palette: ["#A5D0E3", "#FBE8C8", "#5A8A57", "#38B7AA"],
  scene: "hill",
  transfer: 40,
  meta: {
    population: "≈ 5,300 (2022 census)",
    area: "90 km²",
    highest: "Mont Ohiri, 590 m",
    languages: "French (official), Tahitian; English at the resorts, limited elsewhere",
    timezone: "UTC−10 (no daylight saving)",
    nights: "2–3",
    bestTime: "May–October is the dry, cooler season and the best window for lagoon days; humpback whales pass July–November. Vanilla flowers and is hand-pollinated in the second half of the year (roughly Aug–Dec) while curing sheds work through the dry season. Nov–April is hotter, wetter and greener, with cheaper rooms.",
    gettingThere: "There is no airport. Fly Papeete → Raiatea (≈ 45 min, ≈ $150 one-way), then take a boat to Taha'a: the public shuttle or a water taxi takes ≈ 30 min (≈ $12), while resorts run private boat transfers from Raiatea airport that cost far more. Plan the Air Tahiti arrival and the boat carefully; late flights may need an overnight in Raiatea.",
    gettingAround: "Public transport is minimal. Most visitors use resort boats, guesthouse hosts, taxis and organised 4x4 tours; ask your guesthouse about car or scooter hire. The motu resorts are reachable only by boat.",
    dailyBudget: "Guesthouses $150–260/night; motu resorts $800–1,300+/night; dinners $50–100 for two (resorts $120+); tours $60–190 per person.",
    bestFor: ["Foodies and vanilla lovers", "Quiet motu resorts with Bora Bora views", "Snorkeling drifts in the coral garden", "Couples who want to relax rather than sightsee", "Combining with Raiatea"],
    skipIf: ["You want ready-made nightlife or a lot of restaurants", "You dislike boat transfers", "You need overwater bungalows on a budget"],
    goodToKnow: [
      "Most day activities here can be booked from Raiatea, and the resorts sell a full activity menu; guesthouse hosts arrange local tours.",
      "Pari Pari and Manao distilleries and family vanilla farms open by appointment or tour, so book ahead.",
      "The coral garden on Motu Tautau is a drift snorkel: currents carry you along, so wear a life vest if you are a weak swimmer.",
      "Sunday is for church and family; most shops and eateries close, and the village service in Fa'a'aha is a highlight if visited respectfully."
    ]
  },
  act: [
    ["Vanilla plantation visit", "Walk a family vanilla farm, such as La Vallée de la Vanille on the north-east side or Fare Vanira, and see orchids of the Vanilla tahitensis variety hand-pollinated one flower at a time, then dried and cured in wooden sheds. The best time to see pollination is roughly Aug-Dec. Tours are short (one hour) and often free or a few dollars; buy pods and extract directly from the family at fair prices.", "food culture local shopping", "C", 5, 10, 1, 25, "w:Vanilla"],
    ["Island 4x4 safari", "A guided drive across the interior and around the coast to visit a pearl farm, a rum distillery and a vanilla plantation, with fruit tastings and viewpoints over Haamene Bay. Le Taha'a's Fenua safari is from about $108 for 5 hours (8:45 or 13:45 start), and local operators such as Poerani Tours or Heremana Tours run similar 4-hour trips.", "adventure culture scenic food", "C", 4, 100, 4.5, 20, "u:https://www.tahiti.com/activities/tahaa"],
    ["Coral Garden drift snorkel", "The famous coral garden by Motu Tautau: floating in the current over branching coral, giant clams and hundreds of reef fish, sometimes with rays and blacktip sharks. Guides sometimes play ukulele from the boat. Le Taha'a's lagoon safari is about $145 for 3.5 h (minimum 4 people), and it is a highlight of nearly every lagoon tour. Go in the morning when the light and the current are gentlest.", "snorkel wildlife boat", "C", 5, 145, 3.5, 10, "th:island/tahaa"],
    ["Motu Mahana beach picnic day", "A full day by boat around the outer motus: coral-garden snorkel, a stop at a pearl farm or vanilla farm, and a picnic lunch of poisson cru and grilled fish on a white-sand motu, often with reef sharks gliding past. Operators such as Are Tours (≈ €130 per person) and Poerani Tours run these; Le Taha'a's Dream Day version is about $190 with an onboard lunch.", "boat beach snorkel food", "C", 5, 145, 7, 15, "th:island/tahaa"],
    ["Champon Pearl Farm visit", "Family-run black-pearl farm where you watch oyster grafting and see how pearls are sorted; jewelry is sold at farm prices. A related farm, Ia Orana Pearl Farm, has a Bora Bora view on clear days. Combine with a 4x4 tour or a lagoon day, and buy only if you love it.", "shopping culture local", "U", 3, 0, 1, 25, "t:Champon Pearl Farm Taha'a"],
    ["Rum distilleries: Pari Pari & Manao", "Two small artisanal distilleries turn Taha'a sugar cane into agricultural rum. Domaine Pari Pari won a gold medal in 2019 and Rhumerie Manao also offers tastings; both are usually included on 4x4 tours, or arranged by phone. Tastings run $5-15; go with a driver, not on a scooter.", "food culture local", "U", 3, 8, 1.5, 25, "t:Distillerie Pari Pari Taha'a"],
    ["Haamene Bay kayak", "Paddle the long, sheltered arm of Haamene Bay, where the water is flat and green hillsides drop straight to the mangrove. Guesthouses at the mouth of the bay (like Pension Anahata) and tour operators can supply kayaks; expect roughly $50-70 for a guided half day. Early morning is calmest.", "water scenic relax", "U", 3, 55, 2.5, 20, "th:island/tahaa"],
    ["Mont Ohiri guided hike", "A guided climb to the summit of Mont Ohiri (590 m, sometimes written Moiri) through breadfruit and vanilla forest, with views over both Haamene and Hurepiti bays and the lagoon shared with Raiatea. It is a steep, muddy path, so a local guide is essential. Guesthouses can arrange one; expect roughly $70-90 per person and start by 7:30 for cooler air.", "hike scenic adventure", "H", 1, 75, 5, 25, "w:Taha'a"],
    ["Joe Dassin Beach", "A pretty, quiet strip of white sand and coral on the south-west coast, named for the French singer Joe Dassin. There is no road, so you arrive by boat or kayak, or by a 15-minute walk north of Patio (ask a local for the trailhead). There is good snorkeling just off the sand. Pack lunch and water; there are no services.", "beach relax snorkel", "H", 2, 0, 3, 20, "t:Joe Dassin Beach Taha'a"],
    ["Sunday service at Fa'a'aha", "In the village of Fa'a'aha the congregation sings in Tahitian in white dresses and woven hats, and the harmonies are a highlight of many trips. Go respectfully: dress modestly, sit near the back and don't photograph inside without asking. Roughly one hour, usually Sunday mornings; check the time with your host.", "culture local", "H", 2, 0, 1, 25, "w:Taha'a"],
    ["Private romantic sunset cruise", "A two-hour private boat trip around 4:30 pm toward Bora Bora, with a skipper who explains the lagoon's wildlife while the mountains of Bora Bora turn gold. Listed at about $250 per person with a two-person minimum. Bring a light jacket, as the wind picks up.", "romance boat scenic", "U", 3, 250, 2, 10, "u:https://www.tahiti.com/activities/tahaa"],
    ["Vanilla Dream spa ritual", "At Le Taha'a's Tāvai Spa, set over a lotus-and-lily pond, the 90-minute Vanilla Dream treatment starts in a private jacuzzi, then uses Taha'a vanilla balm on the scalp and vanilla monoi oil for a 50-minute massage. Expect roughly $200-250 per person; non-guests should check whether the resort takes outside bookings.", "wellness romance relax", "U", 3, 230, 1.5, 15, "u:https://www.letahaa.com/en-gb/spa"],
    ["Tahitian dance lesson", "A one-hour lesson in Ori Tahiti and Aparima with instruction on tying a pareo, run by Le Taha'a. From about $83 per person. It is silly, sweaty and a great honeymoon memory; book through the resort desk, and non-guests should ask first.", "culture night relax", "U", 2, 83, 1, 15, "u:https://www.letahaa.com/"]
  ],
  stay: [
    ["Le Taha'a Island Resort & Spa by Pearl Resorts", "Overwater resort", "The island's flagship, a Relais & Châteaux resort on Motu Tautau with 48 overwater suites, nine beach villas and two royal villas, an in-house Tāvai Spa and a dive and excursion desk. Rate is for a mid-level suite; overwater suites cost more. Boat transfer from Raiatea airport is required.", "overwater beachfront pool spa view", 950, "u:https://www.letahaa.com/", "Motu Tautau, boat access", "Confirm current rates; frequent seasonal promotions."],
    ["Vahine Island Private Island Resort & Spa", "Private island", "A small, intimate private motu resort with nine bungalows and one royal villa: beach bungalows, beach suites and overwater bungalows facing Bora Bora and Taha'a. Restaurant and bar on site, part of Small Luxury Hotels. Rate is for a beach bungalow.", "beachfront secluded view spa overwater", 850, "u:https://www.vahineprivateisland.com/en/rooms.html", "Motu Tu Vahine, boat access", "Price approximate: confirm. Meals often mandatory as a package."],
    ["Pension Anahata", "Pension", "A family-run guesthouse at the entrance to Haamene Bay with refurbished bungalows on a private white-sand beach, a pontoon, bikes and kayaks. Half-board is available. The best budget base for kayaking and snorkeling right off the beach.", "beachfront local kitchen", 210, "t:Pension Anahata Taha'a", "Haamene Bay entrance", "Price approximate; confirm with the pension."],
    ["Fare Pea Iti", "Boutique", "A small romantic lodge in Patio village, with five spacious bungalows, a pool, private beach, restaurant, free bikes and book exchange. It is close to the Coral Garden, and a good mid-range base if you don't want a motu resort.", "pool beachfront local", 230, "t:Fare Pea Iti Taha'a", "Patio", "Price approximate; confirm."]
  ]
});
