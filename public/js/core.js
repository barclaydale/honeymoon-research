/* Tiare & Tide — core data helpers, routing engine, persistent store.
   Plain classic script (no modules) so the site works when opened straight from disk. */
(function () {
  const HM = (window.HM = window.HM || {});
  HM.islands = {};
  HM.order = [];
  HM.acts = {};   // id -> activity
  HM.stays = {};  // id -> stay
  HM.eats = {};   // id -> restaurant

  /* ---------- vocab ---------- */
  HM.ACT_TAGS = {
    snorkel: "Snorkeling", dive: "Scuba diving", hike: "Hiking", culture: "Culture", history: "History & marae",
    food: "Food & drink", beach: "Beaches", romance: "Romantic", wildlife: "Wildlife", water: "Water sports",
    boat: "Boats & cruises", surf: "Surfing", wellness: "Spa & wellness", shopping: "Pearls & shopping",
    scenic: "Scenic views", adventure: "Adventure", relax: "Slow & relaxed", local: "Local life",
    night: "Evening & shows", bike: "Cycling"
  };
  HM.STAY_TAGS = {
    overwater: "Overwater", beachfront: "Beachfront", pool: "Pool", spa: "Spa", allinc: "Meals included",
    reef: "Great house reef", secluded: "Secluded", local: "Local hosts", kitchen: "Kitchenette", view: "Big views"
  };
  HM.EAT_TAGS = {
    seafood: "Seafood", polynesian: "Polynesian", french: "French", asian: "Asian & fusion", italian: "Italian & pizza", vegetarian: "Vegetarian-friendly",
    romantic: "Romantic", view: "Great view", local: "Local favorite", brunch: "Breakfast & brunch", cocktails: "Cocktails & bar", sweet: "Bakery & sweets", bbq: "Grill & BBQ"
  };
  HM.EAT_TYPES = ["Fine dining", "Restaurant", "Casual", "Roulotte", "Cafe & bakery", "Bar & lounge", "Resort dining"];
  HM.MEALS = [{ k: "b", label: "Breakfast" }, { k: "l", label: "Lunch" }, { k: "d", label: "Dinner" }];
  HM.MEAL_WORD = { b: "breakfast", l: "lunch", d: "dinner" };
  HM.DEFAULT_START = "2027-09-25";   // end of September 2027
  HM.DEFAULT_DAYS = 16;
  HM.TIERS = { C: "Classic", U: "Uncommon", H: "Hidden gem" };
  HM.COST_LABELS = { 1: "Budget-friendly", 2: "Moderate", 3: "Pricey", 4: "Ultra-luxe" };
  HM.COST_HINT = { 1: "≈ under $300/day for two", 2: "≈ $300–550/day for two", 3: "≈ $550–1,000/day for two", 4: "≈ $1,000+/day for two" };
  HM.VIBES = ["Touristy", "Balanced", "Off the beaten path", "Rugged", "Secluded"];
  HM.PACES = ["Chill", "Mixed", "Adventurous"];
  HM.TERRAINS = ["High island", "Atoll"];

  /* ---------- small helpers ---------- */
  const slug = (s) => String(s).toLowerCase().replace(/[’'`ʻ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  HM.slug = slug;
  HM.esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  HM.money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  HM.hours = (mins) => {
    mins = Math.round(mins);
    const h = Math.floor(mins / 60), m = mins % 60;
    if (!h) return m + " min";
    return m ? h + "h " + String(m).padStart(2, "0") + "m" : h + "h";
  };
  HM.durHours = (h) => (h < 1 ? Math.round(h * 60) + " min" : (Math.round(h * 10) / 10).toString().replace(/\.0$/, "") + " h");
  HM.priceLevel = (pp) => (pp <= 0 ? 0 : pp <= 40 ? 1 : pp <= 120 ? 2 : pp <= 250 ? 3 : 4);
  HM.priceLabel = (lvl) => (lvl === 0 ? "Free" : "$".repeat(lvl));
  HM.stayLevel = (ppn) => (ppn <= 200 ? 1 : ppn <= 450 ? 2 : ppn <= 1000 ? 3 : 4);

  /* ---------- link specs: "w:term" wiki, "t:term" tripadvisor, "tt:path" tahiti tourisme, "th:path" tahiti.com, "u:https://…" direct */
  HM.link = function (spec) {
    const i = spec.indexOf(":"), k = spec.slice(0, i), v = spec.slice(i + 1);
    if (k === "w") return { url: "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(v) + "&go=Go", label: "Wikipedia" };
    if (k === "t") return { url: "https://www.tripadvisor.com/Search?q=" + encodeURIComponent(v), label: "Tripadvisor" };
    if (k === "tt") return { url: "https://www.tahititourisme.com/" + v, label: "Tahiti Tourisme" };
    if (k === "th") return { url: "https://www.tahiti.com/" + v, label: "Tahiti.com" };
    let host = "website";
    try { host = new URL(v).hostname.replace(/^www\./, ""); } catch (e) {}
    return { url: v, label: host };
  };

  /* ---------- island registration ----------
     act rows:  [name, description, "tag tag", tier(C|U|H), popularity 1-5, USD per person, hours, one-way travel minutes, "link spec"]
     stay rows: [name, type, description, "tag tag", USD per night for two, "link spec", "location"]            */
  HM.addIsland = function (o) {
    o.activities = (o.act || []).map((r) => {
      const a = { id: o.id + "/" + slug(r[0]), island: o.id, name: r[0], desc: r[1], tags: r[2].split(/\s+/).filter(Boolean), tier: r[3], pop: r[4], pp: r[5], dur: r[6], tr: r[7], link: HM.link(r[8]), mo: r[9] || "" };
      HM.acts[a.id] = a; return a;
    });
    o.lodging = (o.stay || []).map((r) => {
      const s = { id: o.id + "/stay-" + slug(r[0]), island: o.id, name: r[0], type: r[1], desc: r[2], tags: r[3].split(/\s+/).filter(Boolean), ppn: r[4], link: HM.link(r[5]), where: r[6] || "", note: r[7] || "", meals: r[8] || "" };
      HM.stays[s.id] = s; return s;
    });
    o.eats = (o.eat || []).map((r) => {
      const e = { id: o.id + "/eat-" + slug(r[0]), island: o.id, name: r[0], type: r[1], desc: r[2], tags: r[3].split(/\s+/).filter(Boolean), tier: r[4], pp: r[5], meals: r[6] || "", tr: r[7], link: HM.link(r[8]), where: r[9] || "", note: r[10] || "" };
      HM.eats[e.id] = e; return e;
    });
    delete o.act; delete o.stay; delete o.eat;
    HM.islands[o.id] = o; HM.order.push(o.id);
  };
  HM.getIsland = (id) => HM.islands[id];
  HM.getAct = (id) => HM.acts[id];
  HM.getStay = (id) => HM.stays[id];
  HM.getEat = (id) => HM.eats[id];
  // stays whose research note says they can't be booked / aren't open on the trip dates
  HM.stayUnavailable = (s) => /not bookable|unlikely to be available|do not plan around|reported closed/i.test((s && s.note) || "");
  HM.eatLevel = (pp) => (pp <= 20 ? 1 : pp <= 50 ? 2 : pp <= 100 ? 3 : 4);
  HM.mealList = (str) => str.split("").map((k) => HM.MEAL_WORD[k]).filter(Boolean);
  HM.actMins = (a) => Math.round(a.dur * 60 + a.tr * 2);   // activity + travel to and from

  /* ---------- transport graph ----------
     [from, to, mode, in-vehicle minutes, USD per person one-way, note]
     Costs/times are planning estimates (Air Tahiti / Aremiti / Terevau / Tuatea, 2025-26). */
  HM.EDGES = [
    ["tahiti", "moorea", "ferry", 35, 14, "Aremiti or Vaearai fast ferry, Papeete → Vaiare (about 30–45 min; Terevau stopped operating in 2026, so book crossings ahead)"],
    ["tahiti", "moorea", "air", 10, 60, "Air Tahiti hop, about 7 min in the air"],
    ["tahiti", "huahine", "air", 40, 145, "Air Tahiti, several flights daily"],
    ["tahiti", "raiatea", "air", 45, 150, "Air Tahiti, several flights daily"],
    ["tahiti", "borabora", "air", 50, 175, "Air Tahiti, then a short boat transfer from the airport motu"],
    ["tahiti", "maupiti", "air", 60, 200, "Air Tahiti, limited days each week (sometimes routed via Raiatea or Bora Bora)"],
    ["tahiti", "rangiroa", "air", 55, 215, "Air Tahiti, daily"],
    ["tahiti", "tikehau", "air", 55, 220, "Air Tahiti, most days"],
    ["tahiti", "fakarava", "air", 70, 235, "Air Tahiti, most days"],
    ["tahiti", "nukuhiva", "air", 220, 520, "Air Tahiti, a few flights per week, about 3 h 40 m"],
    ["tahiti", "tetiaroa", "air", 20, 330, "Air Tetiaroa, only for guests of The Brando (reported ≈ €600+ round-trip per person; confirm when booking)"],
    ["huahine", "raiatea", "air", 20, 100, "Air Tahiti"],
    ["huahine", "borabora", "air", 30, 115, "Air Tahiti"],
    ["raiatea", "borabora", "air", 20, 100, "Air Tahiti"],
    ["raiatea", "borabora", "boat", 105, 30, "Apetahi Express fast ferry (limited weekly schedule)"],
    ["raiatea", "tahaa", "boat", 30, 12, "Public shuttle boat or water taxi (resorts run private transfers, priced higher)"],
    ["raiatea", "maupiti", "air", 35, 110, "Air Tahiti, limited days"],
    ["borabora", "maupiti", "air", 20, 95, "Air Tahiti, limited days"],
    ["borabora", "maupiti", "boat", 120, 30, "Maupiti Express (a few sailings a week; can cancel in high swell)"],
    ["rangiroa", "tikehau", "air", 20, 110, "Air Tahiti, a few flights a week"],
    ["rangiroa", "fakarava", "air", 30, 125, "Air Tahiti, a few flights a week"]
  ];
  HM.BUFFER = { air: 90, ferry: 45, boat: 30 };     // check-in / boarding / bags
  HM.LAYOVER = { air: 120, ferry: 90, boat: 60 };   // connection wait (usually Papeete)
  HM.MODE_NAME = { air: "Flight", ferry: "Ferry", boat: "Boat" };

  HM.route = function (from, to, pref) {
    if (!from || !to || from === to) return null;
    const w = (e) => (pref === "value" ? e[4] * 10 + e[3] / 100 : e[3] + HM.BUFFER[e[2]]);
    const dist = {}, prev = {}, todo = new Set(Object.keys(HM.islands));
    todo.forEach((n) => (dist[n] = Infinity)); dist[from] = 0;
    while (todo.size) {
      let u = null; todo.forEach((n) => { if (u === null || dist[n] < dist[u]) u = n; });
      if (u === null || dist[u] === Infinity) break;
      todo.delete(u); if (u === to) break;
      HM.EDGES.forEach((e) => {
        const [a, b] = e; const v = a === u ? b : b === u ? a : null;
        if (!v || !todo.has(v)) return;
        const alt = dist[u] + w(e);
        if (alt < dist[v]) { dist[v] = alt; prev[v] = { u, e }; }
      });
    }
    if (dist[to] === Infinity) return null;
    const legs = []; let cur = to;
    while (cur !== from) { const p = prev[cur]; legs.unshift({ from: p.u, to: cur, mode: p.e[2], mins: p.e[3], pp: p.e[4], note: p.e[5] }); cur = p.u; }
    const tf = (HM.islands[from] || {}).transfer || 25, tt = (HM.islands[to] || {}).transfer || 25;
    let mins = tf + tt;
    legs.forEach((l, i) => { mins += l.mins + (i === 0 ? HM.BUFFER[l.mode] : HM.LAYOVER[l.mode]); });
    const pp = legs.reduce((s, l) => s + l.pp, 0);
    return { from, to, legs, mins, pp, transfers: tf + tt };
  };
  // Are there materially different options (so a Fastest / Cheapest toggle is worth showing)?
  HM.routeAlt = function (from, to) {
    const a = HM.route(from, to, "fast"), b = HM.route(from, to, "value");
    return a && b && (a.pp !== b.pp || a.mins !== b.mins) ? { fast: a, value: b } : null;
  };

  /* ---------- combos (starter outlines) ---------- */
  const rep = (isl, n) => Array(n).fill(isl);
  HM.COMBOS = [
    { id: "classic", name: "The Classic", blurb: "Papeete, six days on Moorea, eight in Bora Bora.", days: [].concat(rep("tahiti", 1), rep("moorea", 6), rep("borabora", 8), rep("tahiti", 1)) },
    { id: "loop", name: "Society Islands Loop", blurb: "Island-hop Moorea → Huahine → Raiatea → Taha'a → Bora Bora.", days: [].concat(rep("tahiti", 1), rep("moorea", 3), rep("huahine", 3), rep("raiatea", 2), rep("tahaa", 2), rep("borabora", 4), rep("tahiti", 1)) },
    { id: "reef", name: "Reef & Resort", blurb: "Dive-heavy atolls, then a Bora Bora finish.", days: [].concat(rep("tahiti", 1), rep("rangiroa", 4), rep("fakarava", 4), rep("tikehau", 2), rep("borabora", 4), rep("tahiti", 1)) },
    { id: "barefoot", name: "Barefoot & Budget-savvy", blurb: "Pensions, local food, and Maupiti's quiet lagoon.", days: [].concat(rep("tahiti", 1), rep("moorea", 4), rep("huahine", 4), rep("maupiti", 4), rep("borabora", 2), rep("tahiti", 1)) }
  ];

  /* ---------- persistent store ----------
     Ratings and days carry timestamps (rT / day.t / itin.mt / itin.dt) so two people's edits can be merged
     item-by-item (see js/merge.js). Timestamps are assigned centrally in S.save() by diffing against the last snapshot. */
  const KEY = "tiare-tide.honeymoon.v1";
  const blankDay = () => ({ island: null, lodging: null, items: [], pref: "fast", meals: {}, t: 0 });
  const defaults = () => ({
    v: 3, ratings: {}, rT: {},
    itin: { days: Array.from({ length: HM.DEFAULT_DAYS }, blankDay), start: HM.DEFAULT_START, hub: true, extras: 0, allow: { b: 25, l: 45, d: 90 }, mt: 0, dt: 0 }
  });
  const S = (HM.store = { state: defaults(), snap: null });
  const dayKey = (d) => JSON.stringify([d.island, d.lodging, d.items, d.pref, d.meals]);
  const metaKey = (it) => JSON.stringify([it.start, it.hub, it.extras, it.allow]);
  const makeSnap = () => { const st = S.state; return { ratings: Object.assign({}, st.ratings), days: st.itin.days.map(dayKey), len: st.itin.days.length, meta: metaKey(st.itin) }; };
  S.rebuildSnap = () => (S.snap = makeSnap());

  S.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw), d = defaults();
        S.state = { v: 3, ratings: p.ratings || d.ratings, rT: p.rT || {}, itin: Object.assign(d.itin, p.itin || {}) };
        const it = S.state.itin;
        it.allow = Object.assign({ b: 25, l: 45, d: 90 }, it.allow || {});
        it.days = (it.days || []).map((x) => Object.assign(blankDay(), x));
        if (!p.v || p.v < 2) {                       // migrate the earliest 12-day / no-dates version
          while (it.days.length < HM.DEFAULT_DAYS) it.days.push(blankDay());
          if (!it.start) it.start = HM.DEFAULT_START;
          if (p.itin && p.itin.meals) it.extras = Number(p.itin.meals) || 0;
        }
        delete it.meals;
        if (!it.days.length) it.days = d.itin.days;
      }
    } catch (e) {}
    S.rebuildSnap();
  };
  S.persistLocal = function () { try { localStorage.setItem(KEY, JSON.stringify(S.state)); } catch (e) {} };
  // stamp whatever changed since the last snapshot, so the merge knows which side is newer for each item
  S.stamp = function () {
    const st = S.state, it = st.itin, snap = S.snap || makeSnap(), now = Date.now();
    new Set([...Object.keys(st.ratings), ...Object.keys(snap.ratings)]).forEach((k) => { if ((st.ratings[k] || "") !== (snap.ratings[k] || "")) st.rT[k] = now; });
    it.days.forEach((d, i) => { if (dayKey(d) !== snap.days[i]) d.t = now; });
    if (it.days.length !== snap.len) it.dt = now;
    if (metaKey(it) !== snap.meta) it.mt = now;
    S.snap = makeSnap();
  };
  S.save = function () { S.stamp(); S.persistLocal(); if (S.onSave) S.onSave(); };
  // replace local state with a merged remote state (no stamping: it is not a local edit)
  S.adopt = function (state) {
    const st = window.TTMerge ? window.TTMerge.normalize(state) : state;
    S.state = { v: 3, ratings: st.ratings, rT: st.rT, itin: st.itin }; S.rebuildSnap(); S.persistLocal();
  };
  S.getRating = (key) => S.state.ratings[key] || "";
  S.rate = function (key, val) {  // toggles: same value again clears it
    if (S.state.ratings[key] === val) delete S.state.ratings[key]; else S.state.ratings[key] = val;
    S.save(); return S.state.ratings[key] || "";
  };
  S.uid = () => "i" + Math.random().toString(36).slice(2, 9);
  S.load();
  HM.blankDay = blankDay;

  /* ---------- season: which months does the trip cover? ---------- */
  HM.tripStart = () => { const d = new Date((S.state.itin.start || HM.DEFAULT_START) + "T12:00:00"); return isNaN(d) ? new Date(HM.DEFAULT_START + "T12:00:00") : d; };
  HM.tripEnd = () => { const d = HM.tripStart(); d.setDate(d.getDate() + Math.max(0, S.state.itin.days.length - 1)); return d; };
  HM.tripMonths = () => {
    const m = new Set(), d = HM.tripStart(), n = S.state.itin.days.length;
    for (let i = 0; i < n; i++) { m.add(d.getMonth() + 1); d.setDate(d.getDate() + 1); }
    return m;
  };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  HM.moLabel = (mo) => { const [a, b] = String(mo).split("-").map(Number); return b && b !== a ? MON[a - 1] + "–" + MON[b - 1] : MON[a - 1]; };
  // "in" if the activity's months overlap the trip, "out" if not, "" if year-round
  HM.season = function (mo) {
    if (!mo) return "";
    const [a, b0] = String(mo).split("-").map(Number), b = b0 || a, months = HM.tripMonths();
    const hit = [...months].some((m) => (a <= b ? m >= a && m <= b : m >= a || m <= b));
    return hit ? "in" : "out";
  };
  HM.fmtDate = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  HM.tripRangeLabel = () => HM.fmtDate(HM.tripStart()) + " – " + HM.fmtDate(HM.tripEnd()) + ", " + HM.tripEnd().getFullYear();

  /* ---------- where is something already planned? ---------- */
  HM.placedDays = function (kind, id) {
    const out = [];
    S.state.itin.days.forEach((d, i) => {
      if (kind === "a" && d.items.some((x) => x.t === "a" && x.id === id)) out.push(i + 1);
      else if (kind === "e" && d.meals && Object.values(d.meals).some((m) => m && m.r === id)) out.push(i + 1);
      else if (kind === "s" && d.lodging === id) out.push(i + 1);
    });
    return out;
  };
  HM.placedLabel = (days, kind) => {
    if (!days.length) return "";
    const list = days.length > 3 ? days.slice(0, 3).join(", ") + " +" + (days.length - 3) : days.join(", ");
    return (kind === "s" ? "Booked: Day " : "On Day ") + list;
  };

  /* ---------- trip math ---------- */
  HM.calcTrip = function () {
    const it = S.state.itin, out = { days: [], totals: { act: 0, travel: 0, stay: 0, meals: 0, extras: 0, all: 0 }, daysOn: {}, route: [] };
    let prev = null;
    it.days.forEach((d, idx) => {
      const day = { idx, island: d.island, travel: null, depart: null, items: [], lodging: null, mins: 0, costs: { act: 0, travel: 0, stay: 0, meals: 0 }, meals: {} };
      if (d.island) {
        const from = prev || (it.hub ? "tahiti" : null);
        if (from && from !== d.island) {
          day.travel = HM.route(from, d.island, d.pref || "fast");
          day.alt = HM.routeAlt(from, d.island);
        }
        if (prev !== d.island) out.route.push(d.island);
        prev = d.island;
        out.daysOn[d.island] = (out.daysOn[d.island] || 0) + 1;
      }
      if (it.hub && idx === it.days.length - 1 && prev && prev !== "tahiti") {
        day.depart = HM.route(prev, "tahiti", d.pref || "fast");
      }
      if (day.travel) { day.mins += day.travel.mins; day.costs.travel += day.travel.pp * 2; }
      if (day.depart) { day.mins += day.depart.mins; day.costs.travel += day.depart.pp * 2; }
      d.items.forEach((item) => {
        if (item.t === "a") {
          const a = HM.getAct(item.id); if (!a) return;
          const m = HM.actMins(a), c = a.pp * 2;
          day.items.push({ uid: item.uid, t: "a", a, mins: m, cost: c }); day.mins += m; day.costs.act += c;
        } else {
          const m = Math.round((item.hrs || 0) * 60), c = Number(item.cost) || 0;
          day.items.push({ uid: item.uid, t: "c", name: item.name, hrs: item.hrs, mins: m, cost: c, note: item.note || "" }); day.mins += m; day.costs.act += c;
        }
      });
      if (d.lodging) { const s = HM.getStay(d.lodging); if (s) { day.lodging = s; day.costs.stay += s.ppn; } }

      /* meals: hotel-included meals are assumed eaten at the hotel (breakfast comes from LAST night's hotel;
         lunch and dinner from tonight's), otherwise a chosen restaurant, otherwise the unplanned-meal allowance. */
      const lastNight = idx > 0 ? HM.getStay(it.days[idx - 1].lodging) : null;
      HM.MEALS.forEach(({ k }) => {
        const host = k === "b" ? lastNight : day.lodging, chosen = (d.meals || {})[k];
        let m;
        if (chosen && chosen.r && HM.getEat(chosen.r)) { const e = HM.getEat(chosen.r); m = { kind: "eat", e, cost: e.pp * 2, override: !!(host && host.meals.includes(k)) }; }
        else if (host && host.meals.includes(k) && !(chosen && (chosen.out || chosen.skip))) m = { kind: "hotel", host, cost: 0 };
        else if (chosen && chosen.skip) m = { kind: "skip", cost: 0 };
        else if (!d.island) m = { kind: "none", cost: 0 };
        else m = { kind: chosen && chosen.out ? "out" : "open", cost: Number(it.allow[k]) || 0, hostHas: !!(host && host.meals.includes(k)) };
        day.meals[k] = m; day.costs.meals += m.cost;
      });
      day.cost = day.costs.act + day.costs.travel + day.costs.stay + day.costs.meals + (d.island ? Number(it.extras) || 0 : 0);
      out.totals.act += day.costs.act; out.totals.travel += day.costs.travel; out.totals.stay += day.costs.stay; out.totals.meals += day.costs.meals;
      if (d.island) out.totals.extras += Number(it.extras) || 0;
      out.days.push(day);
    });
    out.totals.all = out.totals.act + out.totals.travel + out.totals.stay + out.totals.meals + out.totals.extras;
    return out;
  };
  HM.dayDate = function (idx) {
    const d = HM.tripStart(); if (!S.state.itin.start) return null;
    d.setDate(d.getDate() + idx);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };
})();
