// node data/_check.js [id ...]  — validates island data files against the schema the UI expects.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const win = { addEventListener() {}, localStorage: { getItem() { return null; }, setItem() {} } };
const ctx = vm.createContext({ window: win, localStorage: win.localStorage, console, URL, Set, Math, JSON, encodeURIComponent });
vm.runInContext(fs.readFileSync(path.join(root, "js/core.js"), "utf8"), ctx, { filename: "core.js" });
const HM = win.HM;
ctx.HM = HM; // in a browser `window.HM` is also a bare global
const only = process.argv.slice(2);
const files = fs.readdirSync(__dirname).filter((f) => f.endsWith(".js") && !f.startsWith("_") && (!only.length || only.includes(f.replace(".js", ""))));
let errors = 0, warns = 0;
const err = (f, m) => { errors++; console.log("  ERROR [" + f + "] " + m); };
const warn = (f, m) => { warns++; console.log("  warn  [" + f + "] " + m); };
const KNOWN_IDS = ["tahiti","moorea","borabora","huahine","raiatea","tahaa","maupiti","rangiroa","fakarava","tikehau","nukuhiva","tetiaroa"];
files.forEach((f) => {
  const before = HM.order.length;
  try { vm.runInContext(fs.readFileSync(path.join(__dirname, f), "utf8"), ctx, { filename: f }); }
  catch (e) { err(f, "failed to run: " + e.message); return; }
  if (HM.order.length !== before + 1) { err(f, "expected exactly one HM.addIsland call"); return; }
  const id = HM.order[HM.order.length - 1], o = HM.islands[id];
  if (id + ".js" !== f) err(f, "id '" + id + "' does not match filename");
  if (!KNOWN_IDS.includes(id)) err(f, "unknown island id");
  ["name","group","tagline","short","unique","scene"].forEach((k) => { if (!o[k] || typeof o[k] !== "string") err(f, "missing string field " + k); });
  if (![1,2,3,4].includes(o.cost)) err(f, "cost must be 1-4");
  if (!HM.VIBES.includes(o.vibe)) err(f, "bad vibe " + o.vibe);
  if (!HM.PACES.includes(o.pace)) err(f, "bad pace " + o.pace);
  if (!HM.TERRAINS.includes(o.terrain)) err(f, "bad terrain " + o.terrain);
  if (!["peaks","spire","twin","ridges","atoll","hill"].includes(o.scene)) err(f, "bad scene " + o.scene);
  if (!Array.isArray(o.scores) || o.scores.length !== 4 || o.scores.some((n) => !(n >= 1 && n <= 5))) err(f, "scores must be 4 numbers 1-5");
  if (!Array.isArray(o.palette) || o.palette.length !== 4 || o.palette.some((c) => !/^#[0-9a-f]{6}$/i.test(c))) err(f, "palette must be 4 hex colours");
  if (!(o.transfer >= 0)) err(f, "transfer minutes required");
  const m = o.meta || {};
  ["population","area","highest","languages","timezone","nights","bestTime","gettingThere","gettingAround","dailyBudget"].forEach((k) => { if (!m[k]) err(f, "meta." + k + " missing"); });
  ["bestFor","skipIf","goodToKnow"].forEach((k) => { if (!Array.isArray(m[k]) || m[k].length < 2) err(f, "meta." + k + " needs 2+ entries"); });
  if (o.short && o.short.split(/\s+/).length > 60) warn(f, "short is long (" + o.short.split(/\s+/).length + " words)");
  if (o.tagline && o.tagline.split(/\s+/).length > 10) warn(f, "tagline is long");
  if (o.activities.length < 10) warn(f, "only " + o.activities.length + " activities (aim 12-18)");
  if (o.lodging.length < 3 && id !== "tetiaroa") warn(f, "only " + o.lodging.length + " stays");
  const ids = new Set(), tiers = { C: 0, U: 0, H: 0 };
  o.activities.forEach((a) => {
    if (ids.has(a.id)) err(f, "duplicate activity id " + a.id); ids.add(a.id);
    if (!a.desc || a.desc.length < 60) warn(f, a.name + ": description very short");
    if (a.desc && a.desc.length > 520) warn(f, a.name + ": description long (" + a.desc.length + " chars)");
    if (!a.tags.length || a.tags.length > 4) err(f, a.name + ": needs 1-4 tags");
    a.tags.forEach((t) => { if (!HM.ACT_TAGS[t]) err(f, a.name + ": unknown tag " + t); });
    if (!HM.TIERS[a.tier]) err(f, a.name + ": bad tier " + a.tier); else tiers[a.tier]++;
    if (!(a.pop >= 1 && a.pop <= 5)) err(f, a.name + ": popularity must be 1-5");
    if (!(a.pp >= 0)) err(f, a.name + ": pp must be >= 0");
    if (!(a.dur > 0 && a.dur <= 14)) err(f, a.name + ": dur out of range");
    if (!(a.tr >= 0 && a.tr <= 240)) err(f, a.name + ": tr out of range");
    if (!a.link || !/^https?:\/\//.test(a.link.url)) err(f, a.name + ": bad link");
  });
  if (tiers.H < 2) warn(f, "fewer than 2 hidden gems"); if (tiers.C < 3) warn(f, "fewer than 3 classics");
  // --- round 2: seasonality, restaurants, hotel-included meals
  if (!m.yourDates || m.yourDates.length < 60) err(f, "meta.yourDates missing/too short (late Sept–early Oct 2027 note)");
  o.activities.forEach((a) => { if (a.mo && !/^(1[0-2]|[1-9])(-(1[0-2]|[1-9]))?$/.test(a.mo)) err(f, a.name + ": bad mo '" + a.mo + "' (use e.g. \"7-11\" or \"11-3\")"); });
  const seasonal = o.activities.filter((a) => a.mo).length;
  console.log("  seasonal activities with months: " + seasonal + "/" + o.activities.length);
  const eids = new Set();
  if (o.eats.length < (id === "tetiaroa" ? 3 : 4)) warn(f, "only " + o.eats.length + " restaurants");
  o.eats.forEach((e) => {
    if (eids.has(e.id)) err(f, "duplicate restaurant id " + e.id); eids.add(e.id);
    if (!HM.EAT_TYPES.includes(e.type)) err(f, e.name + ": bad restaurant type " + e.type);
    if (!e.tags.length || e.tags.length > 4) err(f, e.name + ": needs 1-4 tags");
    e.tags.forEach((t) => { if (!HM.EAT_TAGS[t]) err(f, e.name + ": unknown eat tag " + t); });
    if (!HM.TIERS[e.tier]) err(f, e.name + ": bad tier " + e.tier);
    if (!(e.pp >= 0 && e.pp <= 400)) err(f, e.name + ": pp out of range");
    if (!/^[bld]{1,3}$/.test(e.meals)) err(f, e.name + ": meals must be a subset of 'bld', got '" + e.meals + "'");
    if (!(e.tr >= 0 && e.tr <= 240)) err(f, e.name + ": tr out of range");
    if (!e.desc || e.desc.length < 60) warn(f, e.name + ": description short");
    if (e.desc && e.desc.length > 520) warn(f, e.name + ": description long");
    if (!/^https?:\/\//.test(e.link.url)) err(f, e.name + ": bad link");
  });
  o.lodging.forEach((s) => {
    if (s.meals && !/^[bld]{1,3}$/.test(s.meals)) err(f, s.name + ": stay meals must be a subset of 'bld', got '" + s.meals + "'");
    if (s.tags.includes("allinc") && s.meals.length < 2) warn(f, s.name + ": allinc tag but fewer than 2 meals listed");
    if (!s.tags.includes("allinc") && s.meals.length >= 3) warn(f, s.name + ": all three meals included but no allinc tag");
    if (!["Overwater resort","Beach resort","Boutique","Pension","Private island","Eco-lodge","Sailing"].includes(s.type)) err(f, s.name + ": bad stay type " + s.type);
    s.tags.forEach((t) => { if (!HM.STAY_TAGS[t]) err(f, s.name + ": unknown stay tag " + t); });
    if (!(s.ppn > 0)) err(f, s.name + ": ppn required");
    if (!s.desc || s.desc.length < 50) warn(f, s.name + ": description short");
    if (!/^https?:\/\//.test(s.link.url)) err(f, s.name + ": bad link");
  });
  console.log((errors ? "" : "OK    ") + f + ": " + o.activities.length + " activities (C" + tiers.C + "/U" + tiers.U + "/H" + tiers.H + "), " + o.lodging.length + " stays, " + o.eats.length + " restaurants");
});
// Transport graph sanity (only when all islands are present)
if (!only.length && HM.order.length === KNOWN_IDS.length) {
  KNOWN_IDS.forEach((a) => KNOWN_IDS.forEach((b) => { if (a !== b && !HM.route(a, b, "fast")) err("routes", a + " → " + b + " unreachable"); }));
  const r = HM.route("rangiroa", "borabora", "fast");
  console.log("route rangiroa→borabora: " + r.legs.map((l) => l.from + ">" + l.to + " " + l.mode).join(", ") + " = " + HM.hours(r.mins) + ", $" + r.pp + "pp");
}
console.log(errors + " error(s), " + warns + " warning(s)");
process.exit(errors ? 1 : 0);
