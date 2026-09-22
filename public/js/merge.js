/* Tiare & Tide — conflict-free merge of two copies of the shared trip state.
   Used by the browser (js/sync.js) so it must stay dependency-free (plain script, no bundler).
   The server side (src/app/api/state/route.ts) uses the TypeScript twin of this file, src/lib/merge.ts —
   the two must stay logically identical; if you change the rules here, change them there too.

   State shape (v3):
     ratings: { "a:moorea/…": "love"|"like"|"dislike" }     rT: { key: timestamp of last change (kept for cleared ratings too) }
     itin: { days:[{island,lodging,items,pref,meals,t}], start, hub, extras, allow:{b,l,d}, gateway, mt: meta timestamp, dt: day-count timestamp }

   Rules (last-writer-wins, but per item so two people editing different things never clobber each other):
     * each rating key: newer rT wins (a cleared rating is a "tombstone" with a newer timestamp)
     * each day: newer day.t wins
     * settings (start date, hub, extras, meal allowances): newer mt wins as a group
     * trip length: newer dt wins; if neither side ever changed it, the longer trip wins
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
  function normalize(s) {
    s = s && typeof s === "object" ? s : {};
    const it = s.itin && typeof s.itin === "object" ? s.itin : {};
    return {
      v: 3, ratings: obj(s.ratings), rT: obj(s.rT),
      itin: {
        days: (Array.isArray(it.days) ? it.days : []).map((d) => Object.assign(blankDay(), d)),
        start: typeof it.start === "string" ? it.start : "", hub: it.hub !== false, extras: Number(it.extras) || 0,
        allow: Object.assign({ b: 25, l: 45, d: 90 }, obj(it.allow)), gateway: typeof it.gateway === "string" ? it.gateway : "phl",
        mt: Number(it.mt) || 0, dt: Number(it.dt) || 0
      }
    };
  }
  // pick the newer of two values; on a tie prefer more content, then a stable compare
  function pick(ta, a, tb, b) {
    if (ta !== tb) return ta > tb ? a : b;
    const ca = canon(a), cb = canon(b);
    if (ca.length !== cb.length) return ca.length > cb.length ? a : b;
    return ca >= cb ? a : b;
  }

  function merge(x, y) {
    const a = normalize(x), b = normalize(y), out = { v: 3, ratings: {}, rT: {}, itin: {} };
    // ratings
    const keys = new Set([...Object.keys(a.rT), ...Object.keys(b.rT), ...Object.keys(a.ratings), ...Object.keys(b.ratings)]);
    keys.forEach((k) => {
      const ta = a.rT[k] || 0, tb = b.rT[k] || 0;
      const va = a.ratings[k] || "", vb = b.ratings[k] || "";
      const v = pick(ta, va, tb, vb);
      if (v) out.ratings[k] = v;
      out.rT[k] = Math.max(ta, tb);
    });
    // settings
    const ma = { start: a.itin.start, hub: a.itin.hub, extras: a.itin.extras, allow: a.itin.allow, gateway: a.itin.gateway };
    const mb = { start: b.itin.start, hub: b.itin.hub, extras: b.itin.extras, allow: b.itin.allow, gateway: b.itin.gateway };
    const m = pick(a.itin.mt, ma, b.itin.mt, mb);
    Object.assign(out.itin, m, { mt: Math.max(a.itin.mt, b.itin.mt) });
    // trip length
    const la = a.itin.days.length, lb = b.itin.days.length;
    const n = a.itin.dt !== b.itin.dt ? (a.itin.dt > b.itin.dt ? la : lb) : Math.max(la, lb);
    out.itin.dt = Math.max(a.itin.dt, b.itin.dt);
    // days
    out.itin.days = [];
    for (let i = 0; i < n; i++) {
      const da = a.itin.days[i], db = b.itin.days[i];
      const d = da && db ? pick(da.t || 0, da, db.t || 0, db) : da || db || blankDay();
      out.itin.days.push(Object.assign(blankDay(), d));
    }
    return out;
  }
  return { merge, normalize, canon, blankDay };
});
