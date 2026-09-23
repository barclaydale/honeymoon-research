/* Map page: a real Leaflet map (free satellite/street tiles, no API key) of every activity, stay and
   restaurant, plus an animated day-by-day playback of the active itinerary draft — hopping between
   stops on an island, going dark at night, then island-hopping (flight/ferry/boat) to the next island.
   Coordinates are approximate, matched from each item's own text against real named places — see
   js/geo.js for exactly how and why. The international flight home is never shown here: this map is
   just French Polynesia. */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, esc = HM.esc;
  UI.header("map");

  const iname = (id) => (HM.islands[id] || { name: id }).name;
  const TYPE = { a: { label: "Activity", color: "#12938f" }, s: { label: "Stay", color: "#ee6a50" }, e: { label: "Restaurant", color: "#f2b84b" } };
  const RATE_PREFIX = { a: "a", s: "s", e: "r" };
  const MODE_ICON = { air: "✈", ferry: "⛴", boat: "🛥" };
  const geoOf = (kind, item) => HM.geocode(item.island, (item.desc || item.where || "") + " " + item.name, item.id);

  /* ---------- base map ---------- */
  const map = L.map("leaflet-map", { worldCopyJump: false, zoomSnap: 0.25 });
  map.zoomControl.setPosition("bottomleft");   // top-left is where the story-bar sits in Itinerary story mode
  const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 17, attribution: "Tiles &copy; Esri" });
  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" });
  sat.addTo(map);
  L.control.layers({ Satellite: sat, Map: street }, {}, { position: "topright" }).addTo(map);
  L.control.scale({ imperial: true, metric: true, position: "bottomright" }).addTo(map);
  map.fitBounds(L.latLngBounds(HM.order.map((id) => HM.GEO[id].center)), { padding: [36, 36] });

  document.getElementById("map-legend").innerHTML = Object.keys(TYPE).map((k) => `<span><i style="background:${TYPE[k].color}"></i>${TYPE[k].label}</span>`).join("");

  /* ---------- explore mode: every rated/plannable place, filterable ---------- */
  const cluster = L.markerClusterGroup({ maxClusterRadius: 42, spiderfyOnMaxZoom: true, showCoverageOnHover: false });
  const F = { island: "", rating: "nopass", types: { a: true, s: true, e: true } };
  const allItems = [];
  function popupHtml(kind, item) {
    const price = kind === "a" ? (item.pp ? HM.money(item.pp * 2) + " for two" : "Free")
      : kind === "s" ? HM.money(item.ppn) + " / night"
      : "≈ " + HM.money(item.pp) + " pp";
    return `<div class="map-pop"><b>${esc(item.name)}</b><small>${esc(iname(item.island))} · ${TYPE[kind].label} · ${esc(price)}</small>
      ${UI.rate(RATE_PREFIX[kind] + ":" + item.id, false)}
      <a href="island.html?i=${item.island}">Open island page →</a></div>`;
  }
  function buildMarkers() {
    HM.order.forEach((islandId) => {
      const isl = HM.islands[islandId];
      isl.activities.forEach((a) => allItems.push({ kind: "a", item: a }));
      isl.lodging.forEach((s) => allItems.push({ kind: "s", item: s }));
      isl.eats.forEach((e) => allItems.push({ kind: "e", item: e }));
    });
    allItems.forEach((row) => {
      const c = geoOf(row.kind, row.item); if (!c) return;
      row.marker = L.circleMarker(c, { radius: 7, weight: 2, color: "#fff", fillColor: TYPE[row.kind].color, fillOpacity: 0.92 });
      row.marker.bindPopup(() => popupHtml(row.kind, row.item));
    });
  }
  const rateOk = (kind, item) => {
    const r = S.getRating(RATE_PREFIX[kind] + ":" + item.id);
    return F.rating === "all" || (F.rating === "nopass" && r !== "dislike") || (F.rating === "picks" && (r === "love" || r === "like")) || (F.rating === "love" && r === "love");
  };
  function refreshExplore() {
    cluster.clearLayers();
    let shown = 0;
    allItems.forEach(({ kind, item, marker }) => {
      if (!marker || !F.types[kind]) return;
      if (F.island && item.island !== F.island) return;
      if (!rateOk(kind, item)) return;
      cluster.addLayer(marker); shown++;
    });
    const c = document.getElementById("map-count"); if (c) c.textContent = `Showing ${shown} of ${allItems.length}`;
  }
  function renderFilters() {
    const opt = (v, l, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${l}</option>`;
    const chk = (id, on, label) => `<label class="check"><input type="checkbox" id="${id}" ${on ? "checked" : ""}> ${label}</label>`;
    document.getElementById("map-filters").innerHTML = `
      <select id="misl" aria-label="Island">${opt("", "All islands", F.island)}${HM.order.map((id) => opt(id, iname(id), F.island)).join("")}</select>
      <select id="mrate" aria-label="Rating filter">${opt("picks", "My picks (♥ loved + 👍 liked)", F.rating)}${opt("love", "Only ♥ loved", F.rating)}${opt("nopass", "Everything except passed", F.rating)}${opt("all", "Everything", F.rating)}</select>
      <div class="checks">${chk("mt-a", F.types.a, "Activities")}${chk("mt-s", F.types.s, "Stays")}${chk("mt-e", F.types.e, "Restaurants")}</div>
      <span class="map-count" id="map-count"></span>`;
  }
  document.getElementById("map-filters").addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "misl") F.island = t.value;
    else if (t.id === "mrate") F.rating = t.value;
    else if (t.id === "mt-a") F.types.a = t.checked;
    else if (t.id === "mt-s") F.types.s = t.checked;
    else if (t.id === "mt-e") F.types.e = t.checked;
    else return;
    refreshExplore();
  });

  /* ---------- itinerary story mode: an animated walk through the active draft, day by day ---------- */
  const story = (function () {
    const trail = L.layerGroup();
    const mover = L.marker([0, 0], { icon: L.divIcon({ className: "map-mover", iconSize: [18, 18] }), interactive: false });
    let waypoints = [], idx = 0, segT = 0, phase = "idle", playing = false, speed = 1, dwellLeft = 0, lastTs = 0, raf = null;

    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    const travelMs = (wp) => Math.max(1200, Math.min(5000, (wp.mins || 20) * 14));
    const dwellMs = (wp) => (wp.kind === "night" ? 2200 : 1500);

    // one entry per meal already resolved by HM.calcTrip (so "hotel-included" vs "eat out" is exactly what the itinerary shows)
    function mealStop(day, k, label) {
      const m = day.meals[k]; if (!m) return null;
      if (m.kind === "eat") return { kind: "stop", coord: geoOf("e", m.e), caption: `${label}: ${m.e.name}` };
      if (m.kind === "hotel") return { kind: "stop", coord: geoOf("s", m.host), caption: `${label} at ${m.host.name}` };
      return null;
    }
    function dayStops(day) {
      const stops = [], b = mealStop(day, "b", "Breakfast"); if (b) stops.push(b);
      const acts = day.items.filter((x) => x.t === "a"), half = Math.ceil(acts.length / 2);
      acts.slice(0, half).forEach((x) => stops.push({ kind: "stop", coord: geoOf("a", x.a), caption: x.a.name }));
      const l = mealStop(day, "l", "Lunch"); if (l) stops.push(l);
      acts.slice(half).forEach((x) => stops.push({ kind: "stop", coord: geoOf("a", x.a), caption: x.a.name }));
      const d = mealStop(day, "d", "Dinner"); if (d) stops.push(d);
      return stops;
    }
    function travelStop(leg) {
      return { kind: "travel", mode: leg.mode, mins: leg.mins,
        coord: HM.GEO[leg.to].center, caption: `${MODE_ICON[leg.mode] || ""} ${iname(leg.from)} → ${iname(leg.to)} · ${HM.hours(leg.mins)} · ${HM.money(leg.pp * 2)} for two` };
    }
    function build() {
      const trip = HM.calcTrip(), wps = [];
      trip.days.forEach((day, di) => {
        if (!day.island) return;
        if (day.travel) day.travel.legs.forEach((leg) => wps.push(Object.assign(travelStop(leg), { day: di })));
        const stops = dayStops(day).map((s) => Object.assign(s, { day: di }));
        stops.forEach((s) => wps.push(s));
        const stayCoord = day.lodging ? geoOf("s", day.lodging) : null;
        const nightCoord = stayCoord || (stops.length ? stops[stops.length - 1].coord : HM.geocode(day.island, "", "d" + di));
        wps.push({ kind: "night", day: di, coord: nightCoord, caption: `🌙 Night ${di + 1} of ${trip.days.length} · ${day.lodging ? day.lodging.name : iname(day.island)}` });
      });
      const last = trip.days[trip.days.length - 1];
      if (last && last.depart) {
        const departDay = trip.days.length - 1;   // still part of the last real day, not a day that doesn't exist
        last.depart.legs.forEach((leg) => wps.push(Object.assign(travelStop(leg), { day: departDay })));
        wps.push({ kind: "end", day: departDay, coord: HM.GEO.tahiti.center, caption: "🏁 Back in Papeete — the flight home isn't shown here." });
      }
      return wps;
    }

    function caption(wp) {
      const el = document.getElementById("story-caption"); if (!el || !wp) return;
      el.innerHTML = wp.day != null ? `<b>Day ${wp.day + 1}</b> · ${esc(wp.caption)}` : esc(wp.caption);
    }
    function setDayLabel() {
      const el = document.getElementById("story-day"); if (!el) return;
      const wp = waypoints[Math.min(idx, waypoints.length - 1)];
      el.textContent = wp ? `Day ${wp.day + 1}` : "";
    }
    function setNight(on) { const w = document.getElementById("map-wrap") || document.querySelector(".map-wrap"); if (w) w.classList.toggle("night", !!on); }
    function updateControls() {
      const btn = document.getElementById("story-play"); if (btn) btn.textContent = playing ? "Pause" : (phase === "done" ? "Replay" : "Play");
    }

    function reset() {
      waypoints = build(); idx = 0; segT = 0; phase = waypoints.length ? "dwell" : "idle"; dwellLeft = 400; playing = false; lastTs = 0;
      setNight(false);
      const empty = document.getElementById("story-empty");
      if (!waypoints.length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      trail.clearLayers();
      mover.setLatLng(waypoints[0].coord);
      if (!map.hasLayer(mover)) mover.addTo(map);
      if (!map.hasLayer(trail)) trail.addTo(map);
      map.setView(waypoints[0].coord, 12);
      caption(waypoints[0]);
      setDayLabel();
      updateControls();
    }

    function tick(ts) {
      raf = requestAnimationFrame(tick);
      if (!playing) { lastTs = ts; return; }
      const dt = Math.min(200, ts - (lastTs || ts)) * speed; lastTs = ts;
      if (phase === "move") {
        const to = waypoints[idx + 1];
        segT += dt / travelMs(to);
        if (segT >= 1) {
          segT = 1; mover.setLatLng(to.coord);
          idx++; phase = "dwell"; dwellLeft = dwellMs(to);
          trail.addLayer(L.polyline([waypoints[idx - 1].coord, to.coord], { color: "#fff", weight: 2, opacity: 0.55, dashArray: to.kind === "travel" ? "2 8" : null }));
          caption(to); setDayLabel(); setNight(to.kind === "night");
          if (to.kind === "travel" || to.kind === "night") map.panTo(to.coord, { animate: true, duration: 0.6 });
        } else {
          mover.setLatLng(lerp(waypoints[idx].coord, to.coord, ease(segT)));
        }
      } else if (phase === "dwell") {
        dwellLeft -= dt;
        if (dwellLeft <= 0) {
          setNight(false);
          if (idx >= waypoints.length - 1) { phase = "done"; playing = false; updateControls(); }
          else { phase = "move"; segT = 0; }
        }
      }
    }
    raf = requestAnimationFrame(tick);

    return {
      start() { reset(); },
      stop() { playing = false; updateControls(); },
      clear() { map.removeLayer(mover); map.removeLayer(trail); setNight(false); },
      play() { if (!waypoints.length) return; if (phase === "done") reset(); playing = true; lastTs = 0; updateControls(); },
      pause() { playing = false; updateControls(); },
      toggle() { playing ? this.pause() : this.play(); },
      setSpeed(s) { speed = s; },
      jumpToDay(day) {
        const at = waypoints.findIndex((w) => w.day === day);
        if (at < 0) return;
        playing = false; idx = Math.max(0, at); segT = 0; phase = "dwell"; dwellLeft = 1;
        mover.setLatLng(waypoints[idx].coord); caption(waypoints[idx]); setDayLabel(); setNight(waypoints[idx].kind === "night");
        map.panTo(waypoints[idx].coord, { animate: true });
        updateControls();
      },
      days() { return HM.calcTrip().days.filter((d) => d.island).map((d) => d.idx); },
      rebuild() { const wasPlaying = playing; reset(); if (wasPlaying) this.play(); },
    };
  })();

  function renderStoryBar() {
    const days = story.days();
    document.getElementById("story-bar").innerHTML = `
      <div class="story-controls">
        <select id="story-draft" aria-label="Which draft to play">${HM.drafts().map((d) => `<option value="${d.id}" ${d.id === S.active ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select>
        <button class="btn sm" type="button" id="story-play">Play</button>
        <button class="btn sm" type="button" id="story-prev">◂ Day</button>
        <button class="btn sm" type="button" id="story-next">Day ▸</button>
        <select id="story-speed" aria-label="Playback speed">${[0.5, 1, 2, 4].map((s) => `<option value="${s}" ${s === 1 ? "selected" : ""}>${s}×</option>`).join("")}</select>
        <span id="story-day" class="chip" style="background:rgba(255,255,255,.12);color:#fff;border:0"></span>
      </div>
      <div class="story-caption" id="story-caption"></div>
      ${days.length ? "" : `<div class="story-empty" id="story-empty">This draft has no islands planned yet. <a href="itinerary.html" style="color:#fff;text-decoration:underline">Add some days</a> to see it play out here.</div>`}`;
  }
  document.getElementById("story-bar").addEventListener("click", (e) => {
    if (e.target.closest("#story-play")) story.toggle();
    else if (e.target.closest("#story-prev")) { const d = currentDay() - 1; if (d >= 0) story.jumpToDay(d); }
    else if (e.target.closest("#story-next")) { const d = currentDay() + 1; story.jumpToDay(d); }
  });
  document.getElementById("story-bar").addEventListener("change", (e) => {
    if (e.target.id === "story-speed") story.setSpeed(+e.target.value);
    else if (e.target.id === "story-draft") { S.setActive(e.target.value); }
  });
  function currentDay() {
    const el = document.getElementById("story-day"); const m = el && el.textContent.match(/\d+/);
    return m ? +m[0] - 1 : 0;
  }

  /* ---------- mode toggle ---------- */
  let mode = null;
  document.getElementById("map-mode").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode);
  });
  function setMode(m) {
    if (m === mode && m !== "story") return;
    mode = m;
    document.getElementById("map-mode").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    document.getElementById("map-filters").hidden = m !== "explore";
    document.getElementById("map-legend").hidden = m !== "explore";
    document.getElementById("story-bar").hidden = m !== "story";
    if (m === "explore") { story.stop(); story.clear(); cluster.addTo(map); }
    else { map.removeLayer(cluster); renderStoryBar(); story.start(); map.fitBounds(L.latLngBounds(HM.order.map((id) => HM.GEO[id].center)), { padding: [36, 36] }); }
  }

  // rating something re-filters the cluster group, which would otherwise close whatever popup you just
  // rated from (its marker gets pulled out and back into the cluster) — defer that rebuild until you close it
  let popupOpen = false, refreshPending = false;
  cluster.on("popupopen", () => { popupOpen = true; });
  cluster.on("popupclose", () => { popupOpen = false; if (refreshPending) { refreshPending = false; refreshExplore(); } });
  function refreshExploreSoon() { if (popupOpen) refreshPending = true; else refreshExplore(); }

  buildMarkers(); renderFilters(); refreshExplore();
  document.addEventListener("hm:rating", refreshExploreSoon);
  document.addEventListener("hm:sync", () => { refreshExploreSoon(); if (mode === "story") { renderStoryBar(); story.rebuild(); } });
  document.addEventListener("hm:itin", () => { if (mode === "story") { renderStoryBar(); story.rebuild(); } });
  setMode("explore");
})();
