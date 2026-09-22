/* Tiare & Tide — conflict-free merge of two copies of the shared trip state.
   Used by the browser (js/sync.js) so it must stay dependency-free (plain script, no bundler).
   The server side (src/app/api/state/route.ts) uses the TypeScript twin of this file, src/lib/merge.ts —
   the two must stay logically identical; if you change the rules here, change them there too.

   State shape (v4):
     ratings: { "a:moorea/…": "love"|"like"|"dislike" }   rT: { key: timestamp of last change (kept for cleared ratings too) }
     itins: { "<draftId>": { name, days:[{island,lodging,items,pref,meals,t}], start, hub, extras, allow:{b,l,d}, gateway,
               mt: settings timestamp, dt: day-count timestamp } }   — one entry per named itinerary draft
     itinsT: { "<draftId>": timestamp a draft last appeared or disappeared }   — like rT, but for drafts as a whole

   Rules (last-writer-wins, but per item so two people editing different things never clobber each other):
     * each rating key: newer rT wins (a cleared rating is a "tombstone" with a newer timestamp)
     * each draft's existence: newer itinsT wins (a deleted draft is a tombstone the same way a cleared rating is)
     * within a draft that exists on both sides: merged exactly as before —
         - each day: newer day.t wins
         - settings (name, start date, hub, extras, meal allowances, gateway): newer mt wins as a group
         - trip length: newer dt wins; if neither side ever changed it, the longer trip wins
     * ties: the side with more content wins, then a stable string compare, so both sides always converge on the same result */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.TTMerge = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const blankDay = () => ({ island: null, lodging: null, items: [], pref: "fast", meals: {}, t: 0 });
  const obj = (o) => (o && typeof o === "object" && !Array.isArray(o) ? Object.assign({}, o) : {});

  // canonical JSON (sorted keys) so equal states always compare equal
  function canon(v) {
    if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
    if (v && typeof v === "object") return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
    return JSON.stringify(v === undefined ? null : v);
  }
  function normOneItin(it) {
    it = it && typeof it === "object" ? it : {};
    return {
      name: typeof it.name === "string" && it.name.trim() ? it.name.trim() : "Untitled draft",
      days: (Array.isArray(it.days) ? it.days : []).map((d) => Object.assign(blankDay(), d)),
      start: typeof it.start === "string" ? it.start : "", hub: it.hub !== false, extras: Number(it.extras) || 0,
      allow: Object.assign({ b: 25, l: 45, d: 90 }, obj(it.allow)), gateway: typeof it.gateway === "string" ? it.gateway : "phl",
      mt: Number(it.mt) || 0, dt: Number(it.dt) || 0
    };
  }
  function normalize(s) {
    s = s && typeof s === "object" ? s : {};
    let itinsSrc = s.itins, itinsTSrc = s.itinsT;
    if (s.itin && typeof s.itin === "object" && !itinsSrc) {   // migrate a v ≤ 3 single-itinerary state to a named draft
      itinsSrc = { main: Object.assign({}, s.itin, { name: "Our itinerary" }) };
      itinsTSrc = { main: Number(s.itin.mt) || Number(s.itin.dt) || 1 };
    }
    const src = itinsSrc && typeof itinsSrc === "object" ? itinsSrc : {};
    const itins = {}, itinsT = obj(itinsTSrc);
    Object.keys(src).forEach((id) => { itins[id] = normOneItin(src[id]); if (!(id in itinsT)) itinsT[id] = 1; });
    return { v: 4, ratings: obj(s.ratings), rT: obj(s.rT), itins, itinsT };
  }
  // pick the newer of two values; on a tie prefer more content, then a stable compare
  function pick(ta, a, tb, b) {
    if (ta !== tb) return ta > tb ? a : b;
    const ca = canon(a), cb = canon(b);
    if (ca.length !== cb.length) return ca.length > cb.length ? a : b;
    return ca >= cb ? a : b;
  }
  // merge one draft that both sides currently have — identical shape/logic to the old single-itinerary merge
  function mergeOneItin(a, b) {
    const out = {};
    const ma = { name: a.name, start: a.start, hub: a.hub, extras: a.extras, allow: a.allow, gateway: a.gateway };
    const mb = { name: b.name, start: b.start, hub: b.hub, extras: b.extras, allow: b.allow, gateway: b.gateway };
    const m = pick(a.mt, ma, b.mt, mb);
    Object.assign(out, m, { mt: Math.max(a.mt, b.mt) });
    const la = a.days.length, lb = b.days.length;
    const n = a.dt !== b.dt ? (a.dt > b.dt ? la : lb) : Math.max(la, lb);
    out.dt = Math.max(a.dt, b.dt);
    out.days = [];
    for (let i = 0; i < n; i++) {
      const da = a.days[i], db = b.days[i];
      const d = da && db ? pick(da.t || 0, da, db.t || 0, db) : da || db || blankDay();
      out.days.push(Object.assign(blankDay(), d));
    }
    return out;
  }

  function merge(x, y) {
    const a = normalize(x), b = normalize(y), out = { v: 4, ratings: {}, rT: {}, itins: {}, itinsT: {} };
    // ratings
    const keys = new Set([...Object.keys(a.rT), ...Object.keys(b.rT), ...Object.keys(a.ratings), ...Object.keys(b.ratings)]);
    keys.forEach((k) => {
      const ta = a.rT[k] || 0, tb = b.rT[k] || 0;
      const va = a.ratings[k] || "", vb = b.ratings[k] || "";
      const v = pick(ta, va, tb, vb);
      if (v) out.ratings[k] = v;
      out.rT[k] = Math.max(ta, tb);
    });
    // itinerary drafts — presence (created / deleted) is tracked in itinsT, exactly like rT tracks a rating's presence;
    // a draft both sides currently have is deep-merged, one only one side has is kept unless the other side deleted it more recently
    const ids = new Set([...Object.keys(a.itinsT), ...Object.keys(b.itinsT), ...Object.keys(a.itins), ...Object.keys(b.itins)]);
    ids.forEach((id) => {
      const ta = a.itinsT[id] || 0, tb = b.itinsT[id] || 0, ia = a.itins[id], ib = b.itins[id];
      out.itinsT[id] = Math.max(ta, tb);
      if (ia && ib) out.itins[id] = mergeOneItin(ia, ib);
      else if (ta === tb) { if (ia) out.itins[id] = ia; else if (ib) out.itins[id] = ib; }
      else if (ta > tb) { if (ia) out.itins[id] = ia; }
      else if (ib) out.itins[id] = ib;
    });
    return out;
  }
  return { merge, normalize, canon, blankDay };
});
