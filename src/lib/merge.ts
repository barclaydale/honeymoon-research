/* Tiare & Tide — conflict-free merge of two copies of the shared trip state.

   This is the server-side (TypeScript) twin of public/js/merge.js, which the browser loads
   as a plain script (js/sync.js talks to /api/state and merges the response the same way
   locally, so a slow network never clobbers work done in the meantime). The two files must
   stay logically identical — if you change the merge rules here, change them there too.

   State shape (v3):
     ratings: { "a:moorea/…": "love"|"like"|"dislike" }     rT: { key: timestamp of last change (kept for cleared ratings too) }
     itin: { days:[{island,lodging,items,pref,meals,t}], start, hub, extras, allow:{b,l,d}, gateway, mt: meta timestamp, dt: day-count timestamp }

   Rules (last-writer-wins, but per item so two people editing different things never clobber each other):
     * each rating key: newer rT wins (a cleared rating is a "tombstone" with a newer timestamp)
     * each day: newer day.t wins
     * settings (start date, hub, extras, meal allowances): newer mt wins as a group
     * trip length: newer dt wins; if neither side ever changed it, the longer trip wins
     * ties: the side with more content wins, then a stable string compare, so both sides always converge on the same result */

export interface Day {
  island: string | null;
  lodging: string | null;
  items: unknown[];
  pref: string;
  meals: Record<string, unknown>;
  t: number;
}

export interface Itin {
  days: Day[];
  start: string;
  hub: boolean;
  extras: number;
  allow: { b: number; l: number; d: number };
  gateway: string;
  mt: number;
  dt: number;
}

export interface TripStateData {
  v: 3;
  ratings: Record<string, string>;
  rT: Record<string, number>;
  itin: Itin;
}

const blankDay = (): Day => ({ island: null, lodging: null, items: [], pref: "fast", meals: {}, t: 0 });
const obj = (o: unknown): Record<string, unknown> =>
  o && typeof o === "object" && !Array.isArray(o) ? { ...(o as Record<string, unknown>) } : {};

// canonical JSON (sorted keys) so equal states always compare equal
export function canon(v: unknown): string {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  }
  return JSON.stringify(v === undefined ? null : v);
}

export function normalize(s: unknown): TripStateData {
  const src = s && typeof s === "object" ? (s as Record<string, unknown>) : {};
  const it = src.itin && typeof src.itin === "object" ? (src.itin as Record<string, unknown>) : {};
  const days = Array.isArray(it.days) ? (it.days as Partial<Day>[]) : [];
  return {
    v: 3,
    ratings: obj(src.ratings) as Record<string, string>,
    rT: obj(src.rT) as Record<string, number>,
    itin: {
      days: days.map((d) => Object.assign(blankDay(), d)),
      start: typeof it.start === "string" ? it.start : "",
      hub: it.hub !== false,
      extras: Number(it.extras) || 0,
      allow: Object.assign({ b: 25, l: 45, d: 90 }, obj(it.allow)) as { b: number; l: number; d: number },
      gateway: typeof it.gateway === "string" ? it.gateway : "phl",
      mt: Number(it.mt) || 0,
      dt: Number(it.dt) || 0,
    },
  };
}

// pick the newer of two values; on a tie prefer more content, then a stable compare
function pick<T>(ta: number, a: T, tb: number, b: T): T {
  if (ta !== tb) return ta > tb ? a : b;
  const ca = canon(a), cb = canon(b);
  if (ca.length !== cb.length) return ca.length > cb.length ? a : b;
  return ca >= cb ? a : b;
}

export function merge(x: unknown, y: unknown): TripStateData {
  const a = normalize(x), b = normalize(y);
  const out: TripStateData = { v: 3, ratings: {}, rT: {}, itin: {} as Itin };

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
