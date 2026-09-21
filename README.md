# Tiare & Tide: French Polynesia honeymoon planner

A static website plus one small serverless function. It runs on **Vercel**, and everything you rate or plan is **saved to a shared database**, so two people on any number of devices see the same itinerary (refresh or not).

| Page | What it does |
|---|---|
| `index.html` | Island cards with tags, filters (budget, crowds, pace, landscape, activities, your picks), outline starters |
| `island.html?i=moorea` | Overview, then **Activities / Places to stay / Restaurants**, with filters, love / like / pass and "add to itinerary" |
| `shortlist.html` | Everything you've loved or liked, grouped by island |
| `itinerary.html` | Drag-and-drop day planner: travel blocks, meals, time meters, running cost |

## Deploy on Vercel (one-time setup)

The repo is already connected, so pushing to `master` deploys it. To turn on shared storage:

1. **Add a database.** Vercel dashboard → your project → **Storage** → **Create Database** → choose **Upstash Redis** (Marketplace) → free plan is plenty → **Connect to Project**. This adds the `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_*`) environment variables automatically.
2. **Pick a shared trip code.** Project → **Settings → Environment Variables** → add `TRIP_CODE` with any passphrase you both know (Production, Preview and Development). Anyone with the site link *and* this code can read and edit the trip; everyone else gets a 401.
3. **Redeploy** (Deployments → ⋯ → Redeploy), because new env vars only apply to new deployments.
4. On **each device**: open the site, click the small pill in the top right ("Set up sync"), enter the trip code. It then shows a green **Synced** dot.

How it behaves:
* Every rating and itinerary change is saved on the device instantly, sent to the database about a second later, and pulled by the other device every ~12 seconds (and whenever its tab regains focus).
* Two people editing at once is fine: ratings and each day are merged item-by-item (`js/merge.js`). If you both edit the very same day, the newer edit wins.
* Offline or server down? It keeps working from the local copy and syncs when it can.
* Set sync up first on the device that has the most data; a brand-new device just pulls everything down.

## Run it locally
```
node scripts/dev-server.js        # http://localhost:8000, trip code "dev", in-memory storage (resets on restart)
```
Or double-click `index.html` (works, but only saves on that browser; there's no sync when opened from a file).

## Editing the content
* `data/<island>.js`: one file per island (activities, stays, restaurants, overview facts, seasonal notes). Format: `data/_SPEC.md` and `data/_SPEC2.md`; example: `data/_example.js`.
* `node data/_check.js` validates every island file and the transport graph.
* `js/core.js`: trip defaults (16 days from 25 Sep 2027), inter-island flight/ferry/boat times and prices (`HM.EDGES`), starter outlines, meal and cost math.
* Prices are rough 2025–26 USD estimates (100 XPF ≈ $1). Resorts renovate and rebrand often: confirm before booking.
