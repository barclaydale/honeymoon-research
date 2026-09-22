# Tiare & Tide: French Polynesia honeymoon planner

A static site (plain HTML/CSS/JS, in `public/`) served by **Next.js**, with one API route
(`/api/state`) backed by **Postgres via Prisma**. It runs on **Vercel**, and everything you
rate or plan is **saved to a shared database**, so two people on any number of devices see the
same itinerary (refresh or not). This mirrors the setup used by the `board-game-night` project
(Next.js + Prisma + Postgres on Vercel) — there's just no login here, since it's only ever the
two of you: a shared trip-code passphrase gates the API instead of accounts.

| Page | What it does |
|---|---|
| `index.html` | Island cards with tags, filters (budget, crowds, pace, landscape, activities, your picks), outline starters |
| `island.html?i=moorea` | Overview, then **Activities / Places to stay / Restaurants**, with filters, love / like / pass and "add to itinerary" |
| `shortlist.html` | Everything you've loved or liked, grouped by island |
| `itinerary.html` | Drag-and-drop day planner: travel blocks, meals, time meters, running cost |

## How it's put together

- **Frontend** (`public/`): unchanged plain HTML/CSS/vanilla JS — no React, no build step for the
  UI itself. Next.js just serves these as static files; `next.config.ts` rewrites `/` to
  `/index.html` since that mapping isn't automatic the way it is on a plain static host.
- **API** (`src/app/api/state/route.ts`): a Next.js Route Handler, the direct replacement for the
  old standalone `api/state.js` Vercel function. Same contract (`GET`/`PUT`, `x-trip-code` header,
  item-by-item merge so two people editing at once never clobber each other), different storage.
- **Storage**: one row in Postgres (`prisma/schema.prisma`, model `TripState`) holding the whole
  trip as JSON, read/merged/written inside a serializable transaction — the Postgres equivalent of
  the compare-and-set this used to do against Redis.
- **Merge logic**: `src/lib/merge.ts` (server) and `public/js/merge.js` (browser) are twins of the
  same conflict-free merge — kept as two files because the browser copy has to stay a
  dependency-free `<script>`, not a bundled module. If you change the merge rules, change both.

## Deploy on Vercel (one-time setup)

1. **Push this repo to GitHub** (if not already) and import it in Vercel: **Add New → Project →**
   select the repo. Framework preset auto-detects as Next.js — leave the defaults.
2. **Add a database.** Vercel dashboard → your project → **Storage** → **Create Database** →
   choose **Postgres** (Neon, via the Vercel Marketplace) → free plan is plenty → **Connect to
   Project**. This sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically for all
   environments. **Note:** creating the database alone isn't enough — click **Connect to Project**
   on the database itself (Storage → your database) so it actually attaches to this Vercel
   project and injects those env vars.
3. **Pick a shared trip code.** Project → **Settings → Environment Variables** → add `TRIP_CODE`
   with any passphrase you both know (Production, Preview and Development). Anyone with the site
   link *and* this code can read and edit the trip; everyone else gets a 401.
4. **Deploy** (Deployments → the first deploy runs automatically after import; after adding env
   vars, **Redeploy** so they take effect — new env vars only apply to new deployments). The build
   command (`prisma generate && prisma migrate deploy && next build`, see `package.json`) creates
   the `TripState` table on the very first deploy by applying `prisma/migrations/`.
5. On **each device**: open the site, click the small pill in the top right ("Set up sync"), enter
   the trip code. It then shows a green **Synced** dot.

How it behaves:
* Every rating and itinerary change is saved on the device instantly, sent to the server about a
  second later, and pulled by the other device every ~12 seconds (and whenever its tab regains
  focus).
* Two people editing at once is fine: ratings and each day are merged item-by-item
  (`src/lib/merge.ts` / `public/js/merge.js`). If you both edit the very same day, the newer edit
  wins.
* Offline or server down? It keeps working from the local copy and syncs when it can.
* Set sync up first on the device that has the most data; a brand-new device just pulls everything
  down.

## Run it locally

```
npm install
vercel link          # once, to connect this checkout to the Vercel project
vercel env pull .env  # pulls the real DATABASE_URL/DATABASE_URL_UNPOOLED/TRIP_CODE from Vercel
npm run dev            # http://localhost:3000
```

`.env` already has harmless placeholder values checked out so `npm install`/`prisma generate`
don't fail with nothing configured, but you need a real `DATABASE_URL` (from `vercel env pull`, or
any Postgres instance you point `prisma migrate dev` at) to actually load or save a trip locally.

Or just double-click `public/index.html` (works, but only saves in that browser; there's no sync
when opened from a file).

## Editing the content
* `public/data/<island>.js`: one file per island (activities, stays, restaurants, overview facts,
  seasonal notes). Format: `public/data/_SPEC.md` and `public/data/_SPEC2.md`; example:
  `public/data/_example.js`.
* `npm run check-data` validates every island file and the transport graph.
* `public/js/core.js`: trip defaults (16 days from 25 Sep 2027), inter-island flight/ferry/boat
  times and prices (`HM.EDGES`), starter outlines, meal and cost math.
* Prices are rough 2025–26 USD estimates (100 XPF ≈ $1). Resorts renovate and rebrand often:
  confirm before booking.
