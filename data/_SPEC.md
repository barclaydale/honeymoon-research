# Island data file spec

Each island lives in `data/<id>.js` and calls `HM.addIsland({...})` (see `js/core.js` for the helper).
Read `data/_example.js` first: it is a complete, valid, correctly-styled reference. Match its tone, density and format.

## Audience and voice
Written for a couple planning a **honeymoon** (two travellers, mid-to-high budget, want romance + some adventure).
Voice: a knowledgeable, warm, honest French Polynesia travel agent. Concrete and specific (names of places, seasons,
what to expect, insider tips), never generic brochure filler. Say honestly when something is touristy, overrated, or hard to reach.

## Object shape

```js
HM.addIsland({
  id: "moorea",                       // lowercase, must match filename and the ids used in js/core.js HM.EDGES
  name: "Moorea",
  group: "Society Islands · Windward",  // archipelago label
  cost: 2,                            // 1 Budget-friendly, 2 Moderate, 3 Pricey, 4 Ultra-luxe (typical all-in daily spend for two)
  vibe: "Balanced",                   // one of: Touristy | Balanced | Off the beaten path | Rugged | Secluded
  pace: "Mixed",                      // one of: Chill | Mixed | Adventurous
  terrain: "High island",             // High island | Atoll
  scores: [4, 3, 4, 3],               // 1-5: [romance, adventure, marine life, culture]
  tagline: "…",                       // <= 8 words, evocative
  short: "…",                         // 2 sentences (~40 words): what the island IS, for the card
  unique: "…",                        // 2-3 sentences: what makes it different from the OTHER islands (be specific and comparative)
  palette: ["#skyTop", "#skyHorizon", "#land", "#lagoon"],  // for generated artwork
  scene: "peaks",                     // peaks | spire | twin | ridges | atoll | hill
  transfer: 30,                       // typical minutes between airport/ferry dock and a typical hotel (used by the travel-time engine)
  meta: {
    population: "≈ 18,000 (2022 census)",
    area: "134 km²",
    highest: "Mont Tohiea, 1,207 m",  // atolls: "≈ 3 m above sea level"
    languages: "French (official), Tahitian; English widely spoken at resorts",
    timezone: "UTC−10 (no daylight saving; 2 h behind US Pacific in summer)",   // Marquesas is UTC−9:30
    nights: "3–4",                    // recommended stay
    bestTime: "…",                    // months + why (dry season May–Oct, whales Jul–Nov, etc.)
    gettingThere: "…",                // from Papeete (PPT): mode, time, rough one-way price. Mention connections if needed
    gettingAround: "…",
    dailyBudget: "…",                 // realistic ranges for two, e.g. "Pensions $180–260/night; dinners $50–90 for two"
    bestFor: ["…", "…", "…"],         // 3-5 short phrases
    skipIf: ["…", "…"],               // 2-3 honest short phrases
    goodToKnow: ["…", "…", "…"]       // 3-4 practical/insider notes (one sentence each)
  },
  act: [ /* 12-18 activity rows, see below */ ],
  stay: [ /* 4-7 lodging rows, see below */ ]
});
```

## Activity rows (array of 9 items)
`[name, description, "space separated tags", tier, popularity 1-5, USD per person, hours, one-way travel minutes, "link spec"]`

* **description**: 1-3 sentences. Include what you actually do/see, best season/time of day, and one practical tip. Mention when a price is per couple/private charter.
* **tags** (only these): snorkel dive hike culture history food beach romance wildlife water boat surf wellness shopping scenic adventure relax local night bike
  (`water` = kayak/SUP/jet-ski/kite, `boat` = cruises/lagoon tours/sailing). 1-4 tags per activity.
* **tier**: `"C"` Classic (what everyone does), `"U"` Uncommon (less-known / needs effort), `"H"` Hidden gem (locals-know-it, off the tourist track). Aim for roughly 40% C, 30% U, 30% H, and make sure H rows are real, credible places or experiences.
* **popularity** 1-5: 5 = nearly every visitor does it, 1 = almost nobody.
* **USD per person**: realistic 2025-26 price for ONE person (0 if free; if included in a resort rate, put 0 and say so in the description). Rough `100 XPF ≈ $1`.
* **hours**: duration of the activity itself, not including travel.
* **one-way travel minutes**: typical travel from where visitors stay to the activity start (0 if it's at the resort/lagoon front). Itinerary time = hours + 2 x this.
* **link spec** (a *learn more* page, choose the most useful that will not break):
  * `"w:Search term"` → Wikipedia (exact-match title goes straight to the article; else shows search results). Best for places, sites, species, history.
  * `"tt:islands/<slug>/what-to-do-in-<slug>/"` → Tahiti Tourisme official page (verified for moorea, bora-bora, raiatea, rangiroa, huahine). Only use paths you are confident exist.
  * `"th:island/<slug>"` → Tahiti.com island page (verified: huahine, tikehau).
  * `"t:Search term"` → Tripadvisor search (fine for tours/operators/restaurants).
  * `"u:https://…"` → a direct URL, ONLY if you have verified it exists (e.g. via WebFetch) or are certain (official operator/resort sites).
  Vary them sensibly: prefer `w:` for places/history/wildlife, `t:` for bookable tours, `u:` for official sites.

## Stay rows (array of 6-8 items)
`[name, type, description, "tags", USD per night for two, "link spec", "location", "optional note"]`
* **type**: one of `Overwater resort`, `Beach resort`, `Boutique`, `Pension`, `Private island`, `Eco-lodge`, `Sailing`.
* **tags** (only these): overwater beachfront pool spa allinc reef secluded local kitchen view
* **price**: typical rate per night for a couple in the mid-range room category (state the category in the description). Full-board pensions: price for two including meals, and set the `allinc` tag.
* **note** (optional): warnings such as "Renovating, check reopening date" or "Brand changed recently: confirm current name".
* Include a spread from budget pensions to top resorts if the island has them. Only list properties you are **confident exist and are operating** (verify by searching). If uncertain, leave it out. Never invent a property.

## Research
Use WebSearch/WebFetch to verify facts (currently operating properties, prices, what's closed, transport). Prefer official sources
(tahititourisme.com, tahiti.com, resort sites). Known facts already verified by the lead:
* Papeete → Bora Bora flight ≈ 50 min; → Raiatea ≈ 45; → Huahine ≈ 40; Tuamotu ≈ 1 h; → Nuku Hiva ≈ 3 h 30-40. Tahiti-Moorea ferry ≈ 30-45 min, ≈ 1,500 XPF one-way.
* Bora Bora: InterContinental Bora Bora Resort & Thalasso Spa closed for renovation in 2026 (reopening ~2027); Le Méridien Bora Bora is now The Westin Bora Bora Resort & Spa; Conrad Bora Bora Nui, Four Seasons, St. Regis, Le Bora Bora by Pearl Resorts all open. Bora Bora full-day lagoon tour ≈ $150-180 pp; Mt Pahia guided hike ≈ 14,000 XPF ($130) pp; Bora Bora population 10,758 (2022).
* Moorea population ≈ 18,200 (2022, incl. Maiao). Humpback whale season July-November. Magic Mountain hike ≈ 90 min round trip. Belvedere gives 360° view of Cook's + Opunohu bays and Mt Rotui.
* Fakarava South Pass (Tumakohua): ~700 grey reef sharks in a 200 m channel, ~1 h boat from Rotoava; 2-tank dive ≈ $100 pp; Fakarava is a UNESCO biosphere reserve. Rangiroa: Tiputa Pass drift dives, Blue Lagoon ~1 h by boat, Gauguin's Pearl farm, pink sand beach. Tikehau: manta cleaning station at the old pearl farm (5 min by boat from Le Tikehau), Bird Island, pink sand, coconut-oil factory, Hina's Bell; Pension Herearii ≈ 25,000 XPF/night for two.
* Nuku Hiva: Vaipo Waterfall (350 m, Hakaui Valley, 3-4 h round trip, guide advised), Hatiheu → Anaho Bay walk ≈ 45 min, Taiohae cathedral + giant tiki + artisan market; Gauguin and Jacques Brel are buried in Atuona, Hiva Oa. Airport is far from Taiohae (≈ 1-1.5 h by road).
* Taputapuatea marae (Raiatea) is UNESCO World Heritage; Faaroa River is the only navigable river in French Polynesia; Taha'a is the "Vanilla Island". Huahine: Maeva marae + fish traps, blue-eyed sacred eels at Faie, Lake Fauna Nui. Maupiti: Mt Teurafaatiu 372 m; Bora Bora–Maupiti boat ≈ 2 h, 3,000 XPF (few sailings/week). Tetiaroa: The Brando is the only resort; Air Tetiaroa flies Papeete → Tetiaroa in ≈ 20 min; rate includes meals, drinks, daily excursions, a daily spa treatment.

## Validate
```
node data/_check.js            # validates every data/*.js file that exists
```
It must print OK for your files with no errors or warnings before you finish.
