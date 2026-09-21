# Tiare & Tide — French Polynesia honeymoon planner

A static website (no build step, no dependencies). Four pages that share one header, stylesheet, data set and saved state:

| Page | What it does |
|---|---|
| `index.html` | Island cards with tags, filters (budget, crowds, pace, landscape, activities, your picks), outline starters |
| `island.html?i=moorea` | Island overview + **Activities / Places to stay** toggle, filters, love / like / pass, "add to itinerary" |
| `shortlist.html` | Everything you've loved or liked, grouped by island |
| `itinerary.html` | Drag-and-drop day planner with auto travel blocks, time meters and a running cost |

## Viewing it
Double-click `index.html` (works in Chrome), or serve the folder so every browser behaves the same:

```
cd honeymoon && python3 -m http.server 8000     # then open http://localhost:8000
```
Ratings and the itinerary are saved in your browser's `localStorage` (per browser, per address).
Open the site the same way each time (always the file, or always localhost) so it finds your saved data.

## Editing the content
* `data/<island>.js` — one file per island (activities, stays, overview facts). Format: `data/_SPEC.md`; example: `data/_example.js`.
* `node data/_check.js` validates every island file and the transport graph.
* `js/core.js` — inter-island flight/ferry/boat times and prices (`HM.EDGES`), buffers for check-in and connections, starter outlines.
* Prices are rough 2025–26 USD estimates (100 XPF ≈ $1). Resorts renovate and rebrand often: confirm before booking.
