HM.addIsland({
  id: "nukuhiva",
  name: "Nuku Hiva",
  group: "Marquesas Islands",
  cost: 2,
  vibe: "Rugged",
  pace: "Adventurous",
  terrain: "High island",
  scores: [3, 5, 2, 5],
  tagline: "Ancient, tattooed, cathedral-cliffed and wild",
  short: "The largest of the Marquesas is French Polynesia at its most raw: basalt spires, 350 m waterfalls, pine-clad plateaus and valleys full of ancient stone tiki. There is no lagoon and no overwater bungalow, but there is deep culture, real hiking and almost no one else.",
  unique: "Nuku Hiva is a different Polynesia from the Society Islands and the Tuamotus: no barrier reef, so no snorkel-and-lounge days, but a living Marquesan culture (carving, tattoo, dance, ancient marae called tohua and paepae) and dramatic wild scenery. It has a time zone of its own (UTC−9:30), a 3 h 40 flight from Tahiti and some of the country's best hiking and horse riding.",
  palette: ["#7C9BB5", "#EBD5B5", "#2E4B3A", "#2F7F86"],
  scene: "ridges",
  transfer: 75,
  meta: {
    population: "≈ 3,100 (2017 census)",
    area: "339 km²",
    highest: "Mont Tekao, 1,224 m",
    languages: "French (official), Marquesan (Nuku Hiva dialect) and Tahitian; English is limited, so pack a phrasebook",
    timezone: "UTC−9:30 (a half-hour offset, no daylight saving; 30 min ahead of Tahiti and 2.5 h behind US Pacific in summer)",
    nights: "4–7",
    bestTime: "Sources differ: local guides call October–April drier, while May–September is cooler; rain is irregular across the year, and waterfalls look best after rain. Sea swell can affect the boat trip to Hakaui, so leave slack. Pack rain gear whenever you go.",
    gettingThere: "From Papeete: Air Tahiti (and Air Moana on some days), nonstop about 3 h 40 min, ≈ $450–520 one-way, a few flights a week. The airport is on the north-west side; the drive to Taiohae takes about 1 h to 1 h 15 min over the plateau on a paved road (a shared transfer ≈ 3,000 XPF).",
    gettingAround: "Rent a 4x4 (Pension Moana Nui and others), take guided 4x4 tours, use e-bikes, or hire boat taxis (for example Te Amoka) for Hakaui and Anaho. Roads north of Taiohae are twisty and partly unpaved; there is one ATM, in Taiohae.",
    dailyBudget: "Pensions $170–260/night for two with breakfast; Le Nuku Hiva ≈ $400+; simple lunches $10–35; a full-day 4x4 tour ≈ $100–115 per person; Hakaui hike ≈ $75–115 per person plus boat.",
    bestFor: ["Culture and archaeology fans", "Serious hikers", "Couples who prefer wild to polished", "Second-honeymoon veterans looking for something new"],
    skipIf: ["You want a lagoon, beach lounging or overwater bungalows", "You have fewer than about 5 nights", "You dislike sandflies, long drives or 4x4 tracks"],
    goodToKnow: [
      "The Aranui 5, a working freighter that doubles as a cruise ship, sails a 12-day loop from Papeete that calls at Nuku Hiva, Ua Pou, Hiva Oa, Tahuata, Fatu Hiva and Ua Huka, plus Fakarava and Rangiroa (from about €4,750 per person, all-in); many travellers use it to see the Marquesas without flying.",
      "Sandflies (nono) are vicious on the black-sand beaches: apply monoi or repellent and cover up.",
      "Flights are few: check the Air Tahiti schedule before booking your other islands, since a missed flight can cost days.",
      "Hire guides for Hakaui and remote ridges; trail markers are minimal and rivers can rise fast."
    ]
  },
  act: [
    ["Vaipo Waterfall via Hakaui Valley", "A boat from Taiohae's fishing port (around 8:30 am) takes you to Hakatea Bay; you then walk about 8–9 km round trip along an ancient royal road past banyans, paepae platforms and basalt cliffs to the foot of the 350 m Vaipo cascade. Go with a guide and be back at the boat by mid-afternoon. Boat shares cost about 3,000 XPF each for six; fewer than six pay a flat fee.", "hike boat scenic adventure", "C", 4, 115, 8, 10, "w:Vaipo Waterfall"],
    ["Hatiheu to Anaho Bay walk", "From Hatiheu a trail climbs over a saddle (about 45–60 min) and drops to Anaho, a crescent of white sand with coconut palms and clear water for snorkelling and sea turtles. Most groups walk in and take a boat back, or the reverse. Bring water and reef shoes; sandflies can be fierce.", "hike beach snorkel scenic", "C", 4, 110, 6, 10, "t:Anaho Bay Nuku Hiva"],
    ["Taiohae: cathedral, tiki & artisan market", "The island's capital stretches along a sheltered bay. The Notre-Dame cathedral has stones from every Marquesan island; nearby are the giant tiki at Paepae Temehea, Fort Colet's tiki, a fruit-and-vegetable market and the fare artisanal, where carvers sell rosewood, bone and tapa. Also worth an easy 45-minute walk to Tohua Koueva, a restored ceremonial platform with tiki.", "culture history local shopping", "C", 5, 0, 3, 5, "w:Taiohae"],
    ["Full-day 4x4: Taipivai, Hatiheu & Aakapa", "A guided 4x4 loop through the three northern valleys: Taipivai and its ancient tiki, Hatiheu Bay with its basalt spires and archaeological platforms, and sometimes Aakapa's dragon ridge, with a Marquesan lunch at Chez Yvonne. Lodges quote about 14,000 XPF per person. Ask for a guide who tells the legends.", "adventure scenic culture history", "C", 5, 110, 8, 10, "t:Nuku Hiva 4x4 tour"],
    ["Lunch at Chez Yvonne, Hatiheu", "The best-known meal on the island: shrimp fritters, char-grilled lobster when in season, goat curry and poisson cru, served across the road from Hatiheu beach. Mains run about 1,500–3,000 XPF. Book ahead, since tour groups fill the room at midday.", "food local relax", "C", 4, 30, 1.5, 60, "t:Chez Yvonne Hatiheu Nuku Hiva"],
    ["Taipivai valley & Melville's Typee", "A green river valley, home to the Typee people, where Herman Melville lived in 1842 and wrote Typee. Stop at Hooumi and the Paeke archaeological site, look for petroglyphs and tiki in the undergrowth, and eat at Roulotte Belle Vue. Best combined with the road to Hatiheu.", "history culture scenic", "U", 3, 0, 2, 45, "w:Taipivai"],
    ["Kamuihei & Hikokua archaeological sites", "A tidy, free complex of stone platforms, petroglyphs and a huge banyan above Hatiheu, once a large ceremonial and residential centre. Best mid-morning when the light comes into the trees; wear shoes with grip and use insect repellent.", "history culture hike", "U", 3, 0, 1.5, 60, "w:Kamuihei"],
    ["Tehaatiki viewpoint hike", "A steep 45-minute climb above Taiohae rewards you with a panorama of the bay and the southern coast, and sometimes manta rays offshore. Guided versions (about 7 km, 3 h) go further. Free on your own, but bring water since there are no shops.", "hike scenic adventure", "H", 2, 0, 2, 5, "t:Tehaatiki Nuku Hiva hike"],
    ["Toovii plateau horse ride", "The cool, pine-forested Toovii plateau (about 800 m) feels like Switzerland dropped into the tropics, and free-roaming horses graze the meadows. Nuku Hiva à Cheval is based in the Hatiheu valley and offers short rides, day rides with Anaho beach stops and multi-day treks. Price is an estimate; contact them directly.", "adventure scenic relax", "U", 2, 90, 3, 60, "u:https://tahititourisme.pf/en-pf/activities/points-of-interest/nuku-hiva-a-cheval-nuku-hiva-en-en-pf-4047196/"],
    ["Toovii plateau & Aakapa hike", "A 2-hour trail crosses the plateau through pine and meadows to the remote village of Aakapa and its jagged 'Sleeping Dragon' ridge. Your lodge will run it as a hiking tour; the weather is best in the dry months, and you should bring a rain jacket regardless. Price is an estimate.", "hike scenic adventure", "H", 2, 70, 5, 60, "w:Toovii"],
    ["Marquesan tattoo & wood-carving", "The Marquesas have one of Polynesia's richest tattoo traditions. Ask at the Taiohae artisan house to meet an artist, and consider carving bone, rosewood or stone in a class (Le Nuku Hiva runs them). Tattoo design and meaning are personal, and healing takes weeks, so don't book on the last day. Price shown is for a class; tattoos are extra.", "culture local shopping", "U", 2, 60, 3, 5, "w:Marquesan tattoo"],
    ["Day trip to Hiva Oa: Gauguin & Brel", "Fly Air Tahiti to Atuona, where Paul Gauguin and Jacques Brel are buried on the hillside cemetery. See the Gauguin Center and Brel museum (with his plane, Jojo). Roughly an hour in the air each way; same-day returns depend on the timetable, so check first. Many prefer an overnight or a stay on Hiva Oa. Price is the return flight alone.", "culture history adventure", "U", 1, 480, 6, 75, "t:Atuona Hiva Oa Gauguin grave"],
    ["Diving with Nuku Dive", "The only dive centre on the island (open since 2022) works about fifteen sites within 10–30 min of Taiohae, with walls, seamounts, caves, reef mantas and scalloped hammerheads in 28°C water and up to 30 m visibility. Marine life differs from the rest of French Polynesia. Price is an estimate; contact them for rates.", "dive wildlife adventure", "U", 2, 130, 3, 10, "u:https://nuku-dive.com/en/scuba-diving.html"]
  ],
  stay: [
    ["Le Nuku Hiva by Pearl Resorts", "Boutique", "Formerly Keikahanui Pearl Lodge: 20 bungalows in a hillside garden above Taiohae Bay with an infinity pool, restaurant and bar, Marquesan artist decor and Relais & Châteaux membership. About 1 h 15 from the airport. Rate is for a Bay View Bungalow; the price is an estimate.", "pool view local", 420, "u:https://www.lenukuhiva.com/en/", "Taiohae hillside, 1 h 15 from airport", "Brand recently changed from Keikahanui; confirm rates."],
    ["Pension Mave Mai", "Pension", "Eight rooms and bungalows run by Jean-Claude and Régina, high above Taiohae with balconies over the bay, breakfast on your terrace and a 5-minute walk to the beach. Rate is for a standard room; bungalows are about $220–250.", "local view", 190, "u:https://www.moanavoyages.com/en/hotels/pension-mave-mai/", "Taiohae heights", ""],
    ["He'e Tai Inn", "Pension", "A greenery-surrounded guesthouse with eight air-conditioned rooms and cultural evenings that include ahima'a cooking, dance and music. Rates are for a Garden Room, with a continental breakfast included; a museum and gallery are nearby.", "local kitchen", 212, "u:https://www.moanavoyages.com/en/hotels/hee-tai-inn/", "Taiohae", ""],
    ["Pension Moana Nui", "Pension", "Seven air-conditioned rooms a few metres from Taiohae's seafront, with a well-known restaurant-pizzeria and plats du jour, and a car rental in town. Simple, central and a good base for arranging tours. Rate is an estimate.", "local", 150, "t:Pension Moana Nui Nuku Hiva", "Taiohae waterfront", "Price is an estimate; confirm."],
    ["Chez Yvonne (Hinako Nui) bungalows", "Pension", "Five simple bungalows in the garden behind the famous restaurant, opposite Hatiheu beach on the north coast and near Anaho and the archaeological sites. A published rate of about 18,000 XPF for two includes all meals; it is quiet and remote and a night here breaks up the drive.", "local allinc secluded", 225, "t:Chez Yvonne Hatiheu Nuku Hiva", "Hatiheu, north coast", "Published rate is older; confirm."]
  ]
});
