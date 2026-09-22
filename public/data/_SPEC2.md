# Round 2: restaurants, hotel-included meals, and a late-September-2027 seasonal review

The couple now knows their dates: **they travel at the end of September 2027 for 16 days (about 25 Sept → 10 Oct 2027).**
That's the tail of the dry season / start of the shoulder season (before the Nov–Apr wet season and cyclone risk).
Read `data/_SPEC.md` first (voice, link specs, verification rules) then this file. You EDIT the existing island files you are assigned
(do not touch other islands' files or any js/css/html file). Keep every existing row valid; only change what's needed.

## Task A: add restaurants: new `eat: [ ... ]` array inside `HM.addIsland({...})`, after `stay:`
Row (11 items):
`[name, type, description, "tags", tier, USD per person for a typical meal there, "meals served", one-way travel minutes, "link spec", "location/area", "note"]`
* **type**: `Fine dining` | `Restaurant` | `Casual` | `Roulotte` | `Cafe & bakery` | `Bar & lounge` | `Resort dining`
* **tags** (1-4, only these): seafood polynesian french asian italian vegetarian romantic view local brunch cocktails sweet bbq
* **tier**: `"C"` Classic (famous / what everyone books), `"U"` Uncommon, `"H"` Hidden gem (locals' places, roulottes, snack shacks, family kitchens). Aim for a real mix incl. cheap eats. Be honest about overrated or tourist-trap places.
* **USD per person**: what one person typically spends on ONE meal there (a main + a soft drink; add wine/cocktails only in the description). Lunch snack-shack $12-25, casual dinner $30-50, resort/fine dining $80-200+. 100 XPF ≈ $1.
* **meals served**: subset of `bld` (breakfast / lunch / dinner), e.g. `"ld"`.
* **one-way travel minutes** from where visitors typically stay (0 if it is at the resort/village centre). Same idea as activities.
* **link spec**: official website (`u:https://…` only if verified with WebFetch or certain) or `t:Search term` (Tripadvisor search) or `w:` for landmark places. Prefer the official site when it exists.
* **location**: village/area. **note** (optional): closed days/hours, reservation advice, cash-only, seasonal closures, "confirm it still operates".
* description: 1-3 sentences: what to order, atmosphere, why it's on the list, one practical tip. Specific > generic.
* **Only list places you have verified exist and are currently operating** (search reviews from 2025-26, official pages). If unsure, leave it out. Never invent a venue.
* Counts (quality over quantity): Tahiti 12-14, Moorea 10-12, Bora Bora 12-14, Huahine 8-9, Raiatea 7-8, Taha'a 5-6, Maupiti 4-5, Rangiroa 7-8, Fakarava 5-6, Tikehau 5-6, Nuku Hiva 6-7, Tetiaroa 3-4 (The Brando's own venues: type `Resort dining`, pp 0 and say "included in the Brando rate"; Tetiaroa has no outside restaurants).
  On pension-only islands (Maupiti, Tikehau, Fakarava, parts of Rangiroa/Nuku Hiva) most eating is at the pension or a handful of snacks/roulottes: list the few real restaurants and the best-known pension dining rooms/snacks that welcome outside guests, and be honest that options are few.
* Include a few breakfast/bakery/coffee options where they exist, and for higher-end islands a sensible spread of budgets.

## Task B: hotel-included meals: 9th element on every `stay:` row
Add `meals` as the 9th item (index 8): a string subset of `bld` = the meals **included in the nightly rate you list** for the mid-range room category you describe.
Use `""` when none are included. Research it (rate pages, resort sites). Examples: full-board pension `"bld"`, half-board `"bd"`, breakfast included `"b"`.
* Many Bora Bora luxury resorts do NOT include breakfast in the base rate (it's often a package/perk): only put `"b"` when you've confirmed a standard rate includes it; mention "breakfast package available" in the description otherwise.
* If you list `meals` of 2+ items make sure the stay has the `allinc` tag; if `allinc` is present the string must have 2+ meals.
* If including the meals changes the nightly price you listed (e.g. full-board pension), keep `ppn` as the *price for two including those meals* and say so in the description.
* Tetiaroa's Brando: `"bld"` (all-inclusive).
The row is then `[name, type, desc, "tags", ppn, "link", "where", "note", "meals"]`: use `""` for note if there is none but you need the 9th slot.

## Task C: seasonal review for 25 Sept – 10 Oct 2027
1. **`mo` on activities (10th item, index 9)**: a month range string for when the activity realistically works/makes sense, e.g. `"7-11"` (July–November), wrap-around allowed `"11-3"`, a single month `"6"`. Leave it off (year-round) when there's no meaningful seasonality. The site compares it to the trip dates and shows "In season for your dates" or "Not in season on your dates". Use it for: humpback whale swims/watching (July-Nov; typically Moorea/Tahiti/Bora Bora/Raiatea/Huahine: verify), Heiva festival (June-July), Hawaiki Nui Va'a canoe race (late Oct/early Nov), hammerhead/manta dive seasons (e.g. Rangiroa hammerheads are ~Dec-Mar), grey reef shark spawning aggregations at Fakarava (June-July around full moon), vanilla harvest/curing on Taha'a and Huahine, Tiare Apetahi flowering, Teahupo'o big-swell season (roughly Apr-Oct), turtle nesting/hatching at Tetiaroa, etc. Research the real months; if a season is a *peak* that overlaps late Sept–early Oct, that's "in" (say "peak" in the description).
2. **Rewrite descriptions/tips that mention seasons or events** so they're correct for the trip window (e.g. don't say "book for the festival" when it's out of season; do say "Late Sept–Oct is prime time for X"). If an activity is out of season on their dates, keep it but its description must say so plainly in its FIRST sentence ("Off-season in late September: …"), so no one is misled.
3. **`meta.yourDates` (new field, required)**: 2-4 sentences specific to this island for **25 Sept – 10 Oct**: typical weather, sea/lagoon conditions and visibility, rainfall/humidity, wildlife or dive conditions in season, festivals/closures/events in those weeks, crowd and price level (school holidays? shoulder?), anything that is missing or best-timed. Be concrete and honest, and cite what you verified (no vague filler). Also fix `meta.bestTime` and any `goodToKnow` items if they're inconsistent with the new note.
4. Check for **2026-27 changes affecting late 2027** (resort closures/renovations/re-openings, e.g. Kia Ora Rangiroa closing Nov 2026, InterContinental Bora Bora reopening ~2027, ferry/flight schedule changes) and put clear `note` text on affected stay rows.
5. Trip length is 16 days across several islands: nothing to change in the data for that.

## Validate
`node data/_check.js <your island ids>`: must show 0 errors and 0 warnings. It reports restaurants count, seasonal-activity count, and enforces `meta.yourDates`, `mo`, `meals` and the restaurant schema.
Final reply (≤150 words): counts per island, seasonal findings that matter most for late Sept 2027, and anything you could not verify.
