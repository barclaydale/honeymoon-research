/* Vercel serverless function: the shared trip state for everyone who knows the trip code.

   GET  /api/state  -> { state }                (current shared state, or null if nothing saved yet)
   PUT  /api/state  -> { state }                (body { state }: merged into the stored state, merged result returned)

   Auth:     header  x-trip-code: <TRIP_CODE>   (TRIP_CODE is an environment variable you set in Vercel)
   Storage:  a Redis database reachable over REST. Works with the Upstash Redis integration from the Vercel Marketplace, which
             sets KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN).
   Local:    LOCAL_MEMORY_STORE=1 keeps everything in memory (used by scripts/dev-server.js). */
const crypto = require("crypto");
const { merge, normalize, canon } = require("../js/merge.js");

const KEY = "tiare-tide:trip:v3";
const MAX_BYTES = 400 * 1024;

/* ---------- storage ---------- */
const mem = globalThis.__ttMem || (globalThis.__ttMem = { value: null });
function restCfg() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}
async function redis(cfg, args) {
  const r = await fetch(cfg.url, { method: "POST", headers: { Authorization: "Bearer " + cfg.token, "content-type": "application/json" }, body: JSON.stringify(args) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error("redis: " + (j.error || r.status));
  return j.result;
}
// compare-and-set so two people saving at the same instant can't lose each other's changes
const CAS = "local cur = redis.call('GET', KEYS[1]); if (cur == false and ARGV[1] == '') or cur == ARGV[1] then redis.call('SET', KEYS[1], ARGV[2]); return 1 end; return 0";
const store = {
  configured: () => process.env.LOCAL_MEMORY_STORE === "1" || !!restCfg(),
  async get() {
    if (process.env.LOCAL_MEMORY_STORE === "1") return mem.value;
    return redis(restCfg(), ["GET", KEY]);
  },
  async cas(oldVal, newVal) {
    if (process.env.LOCAL_MEMORY_STORE === "1") { if ((mem.value || "") === (oldVal || "")) { mem.value = newVal; return true; } return false; }
    const cfg = restCfg();
    try { return (await redis(cfg, ["EVAL", CAS, "1", KEY, oldVal || "", newVal])) === 1; }
    catch (e) { await redis(cfg, ["SET", KEY, newVal]); return true; }   // EVAL unavailable: plain SET
  }
};

/* ---------- helpers ---------- */
function send(res, status, body) { res.statusCode = status; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(body)); }
function codeOk(given) {
  const want = process.env.TRIP_CODE || "";
  const h = (s) => crypto.createHash("sha256").update(String(s)).digest();
  return want.length > 0 && crypto.timingSafeEqual(h(given || ""), h(want));
}
async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;           // Vercel pre-parses JSON
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > MAX_BYTES) throw new Error("too_large"); chunks.push(c); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

module.exports = async function handler(req, res) {
  try {
    if (!process.env.TRIP_CODE) return send(res, 503, { error: "not_configured", message: "Set the TRIP_CODE environment variable in Vercel." });
    if (!store.configured()) return send(res, 503, { error: "no_storage", message: "Connect a Redis database (Upstash) to this Vercel project." });
    if (!codeOk(req.headers["x-trip-code"])) return send(res, 401, { error: "bad_code" });

    if (req.method === "GET") {
      const raw = await store.get();
      return send(res, 200, { state: raw ? JSON.parse(raw) : null, now: Date.now() });
    }
    if (req.method === "PUT" || req.method === "POST") {
      const body = await readBody(req);
      if (!body || typeof body.state !== "object" || body.state === null) return send(res, 400, { error: "bad_body" });
      const incoming = normalize(body.state);
      if (incoming.itin.days.length > 60) return send(res, 400, { error: "too_many_days" });
      for (let attempt = 0; attempt < 12; attempt++) {
        if (attempt) await new Promise((r) => setTimeout(r, 15 + Math.random() * 60 * attempt));   // jittered backoff when someone else wrote first
        const raw = await store.get();
        const merged = merge(raw ? JSON.parse(raw) : null, incoming);
        const next = JSON.stringify(merged);
        if (next.length > MAX_BYTES) return send(res, 413, { error: "too_large" });
        if (raw && canon(JSON.parse(raw)) === canon(merged)) return send(res, 200, { state: merged, now: Date.now() });   // nothing new
        if (await store.cas(raw, next)) return send(res, 200, { state: merged, now: Date.now() });
      }
      return send(res, 409, { error: "busy" });
    }
    res.setHeader("Allow", "GET, PUT");
    return send(res, 405, { error: "method_not_allowed" });
  } catch (e) {
    return send(res, e.message === "too_large" ? 413 : 500, { error: "server_error", message: String(e.message || e) });
  }
};
