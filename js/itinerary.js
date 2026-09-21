/* Itinerary builder: drag & drop activities / stays onto days, auto travel blocks, per-day time meter, running cost. */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, A = HM.actions, esc = HM.esc;
  UI.header("itinerary");
  const it = () => S.state.itin;
  const CAP = 720; // minutes of usable day (12 h)
  const dot = (id) => `hsl(${(HM.order.indexOf(id) * 47 + 170) % 360} 52% 44%)`;
  const iname = (id) => (HM.islands[id] || { name: id }).name;
  const PRESETS = [
    { name: "Arrive in Papeete: international flight, transfer & rest", hrs: 4, cost: 0 },
    { name: "Depart Papeete: flight home", hrs: 5, cost: 0 },
    { name: "Beach & pool downtime", hrs: 4, cost: 0 },
    { name: "Long lunch & lazy afternoon", hrs: 2.5, cost: 110 },
    { name: "Romantic splurge dinner", hrs: 2.5, cost: 260 },
    { name: "Rental car or scooter for the day", hrs: 0, cost: 110 }
  ];
  const picksExist = Object.values(S.state.ratings).some((v) => v === "love" || v === "like");
  const P = { tab: "acts", island: "", rating: picksExist ? "picks" : "nopass", q: "" };
  let drag = null;
  const commit = () => { S.save(); UI.refreshNav(); document.dispatchEvent(new CustomEvent("hm:itin")); };

  document.getElementById("print").innerHTML = UI.icons.print + " Print / save as PDF";
  document.getElementById("print").onclick = () => window.print();
  document.getElementById("reset").onclick = () => { if (confirm("Clear every day, activity and stay from your itinerary? Your ratings are kept.")) { S.state.itin.days = S.state.itin.days.map(() => ({ island: null, lodging: null, items: [], pref: "fast" })); commit(); } };

  /* ---------- trip bar + settings ---------- */
  function renderBar(trip) {
    const t = trip.totals, n = trip.days.reduce((s, d) => s + d.items.length, 0);
    const pills = trip.route.map((id) => `<i>${esc(iname(id))}</i>`).join("→");
    document.getElementById("tripbar").innerHTML = `<div class="total"><small>Estimated total · 2 travelers</small><b>${HM.money(t.all)}</b></div>
      <div class="break"><span><small>Activities</small><b>${HM.money(t.act)}</b></span><span><small>Inter-island travel</small><b>${HM.money(t.travel)}</b></span><span><small>Places to stay</small><b>${HM.money(t.stay)}</b></span><span><small>Meals &amp; extras</small><b>${HM.money(t.meals)}</b></span></div>
      <div class="trip-route">${trip.route.length ? pills : "Pick an island for Day 1 to begin"} <span style="opacity:.7">· ${trip.days.length} days · ${n} planned</span></div>`;
  }
  function renderSettings() {
    const i = it();
    document.getElementById("settings").innerHTML = `<label>Trip length <button class="btn sm" data-days="-1" type="button" aria-label="Remove a day">−</button><input id="ndays" type="number" min="1" max="30" value="${i.days.length}"><button class="btn sm" data-days="1" type="button" aria-label="Add a day">+</button> days</label>
      <label>${UI.icons.cal} Start date <input id="start" type="date" value="${esc(i.start)}"></label>
      <label title="Adds the trip's first arrival leg and the return leg on the last day"><input id="hub" type="checkbox" ${i.hub ? "checked" : ""}> Fly in and out of Papeete (adds arrival &amp; return travel)</label>
      <label>Meals &amp; extras <b>$</b><input id="meals" type="number" min="0" step="10" value="${i.meals || 0}"> /day for two</label>`;
  }
  const setLen = (n) => {
    n = Math.max(1, Math.min(30, n | 0)); const i = it();
    if (n < i.days.length && i.days.slice(n).some((d) => d.items.length || d.lodging) && !confirm(`Removing days ${n + 1}–${i.days.length} deletes what you've planned on them. Continue?`)) return renderSettings();
    if (n > i.days.length) A.ensureDays(n); else i.days.length = n; commit();
  };
  document.getElementById("settings").addEventListener("click", (e) => { const b = e.target.closest("[data-days]"); if (b) setLen(it().days.length + +b.dataset.days); });
  document.getElementById("settings").addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "ndays") setLen(+t.value); else if (t.id === "start") { it().start = t.value; commit(); } else if (t.id === "hub") { it().hub = t.checked; commit(); } else if (t.id === "meals") { it().meals = Math.max(0, +t.value || 0); commit(); }
  });

  /* ---------- pool (left column) ---------- */
  const rateOk = (key) => { const r = S.getRating(key); return P.rating === "all" || (P.rating === "nopass" && r !== "dislike") || (P.rating === "picks" && (r === "love" || r === "like")) || (P.rating === "love" && r === "love"); };
  const dragAttr = (o) => `draggable="true" data-drag="${esc(JSON.stringify(o))}"`;
  const ratedDot = (key) => { const r = S.getRating(key); return r === "love" || r === "like" ? `<span class="rdot ${r}" title="${r === "love" ? "Loved" : "Liked"}"></span>` : ""; };
  function renderPool() {
    let body = "";
    if (P.tab === "acts" || P.tab === "stay") {
      const src = P.tab === "acts" ? Object.values(HM.acts) : Object.values(HM.stays), q = P.q.toLowerCase();
      const rows = src.filter((x) => (!P.island || x.island === P.island) && rateOk((P.tab === "acts" ? "a:" : "s:") + x.id) && (!q || (x.name + " " + iname(x.island)).toLowerCase().includes(q)))
        .sort((a, b) => HM.order.indexOf(a.island) - HM.order.indexOf(b.island) || (P.tab === "acts" ? b.pop - a.pop : a.ppn - b.ppn));
      body = rows.map((x) => P.tab === "acts"
        ? `<div class="pitem" ${dragAttr({ k: "act", id: x.id })}><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.name)}</b><small>${ratedDot("a:" + x.id)}${esc(iname(x.island))} · ${HM.hours(HM.actMins(x))} · ${x.pp ? HM.money(x.pp * 2) : "free"}</small></div><button class="mini-add" type="button" data-add="act" data-id="${esc(x.id)}" aria-label="Add ${esc(x.name)} to a day">${UI.icons.plus}</button></div>`
        : `<div class="pitem" ${dragAttr({ k: "stay", id: x.id })}><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.name)}</b><small>${ratedDot("s:" + x.id)}${esc(iname(x.island))} · ${HM.money(x.ppn)}/night</small></div><button class="mini-add" type="button" data-add="stay" data-id="${esc(x.id)}" aria-label="Set ${esc(x.name)} as lodging">${UI.icons.plus}</button></div>`).join("");
      if (!body) {
        const what = P.tab === "acts" ? "activities" : "stays";
        body = `<p style="padding:18px;color:var(--muted);font-size:13px">${P.rating === "picks" ? `Nothing here yet. Love or like ${what} on the island pages, or switch the filter above to “Everything except passed”.` : "No matches."}</p>`;
      }
    } else {
      body = PRESETS.map((p, n) => `<div class="pitem" ${dragAttr({ k: "preset", n })}><span class="grip">${UI.icons.grip}</span><div><b>${esc(p.name)}</b><small>${p.hrs ? HM.durHours(p.hrs) : "no time"} · ${p.cost ? HM.money(p.cost) : "no cost"}</small></div><span></span></div>`).join("") +
        `<form id="custom" class="pitem" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;cursor:default"><b style="grid-column:1/-1">Your own block</b><input name="name" placeholder="e.g. Sunset photoshoot" required style="grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><input name="hrs" type="number" step="0.5" min="0" placeholder="Hours" style="border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><input name="cost" type="number" min="0" placeholder="$ for two" style="border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><select name="day" style="grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit">${it().days.map((_, i) => `<option value="${i}">Day ${i + 1}</option>`).join("")}</select><button class="btn sm primary" style="grid-column:1/-1;justify-content:center" type="submit">Add to day</button></form>`;
    }
    const opt = (v, l, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${l}</option>`;
    document.getElementById("pool").innerHTML = `<div class="pool-head">
      <div class="seg" id="ptab">${[["acts", "Activities"], ["stay", "Stays"], ["extra", "Extras"]].map((t) => `<button type="button" data-t="${t[0]}" aria-pressed="${P.tab === t[0]}">${t[1]}</button>`).join("")}</div>
      ${P.tab === "extra" ? "" : `<select id="pisl" aria-label="Island">${opt("", "All islands", P.island)}${HM.order.map((id) => opt(id, iname(id), P.island)).join("")}</select>
      <select id="prate" aria-label="Rating filter">${opt("picks", "My picks (♥ loved + 👍 liked)", P.rating)}${opt("love", "Only ♥ loved", P.rating)}${opt("nopass", "Everything except passed", P.rating)}${opt("all", "Everything", P.rating)}</select>
      <input id="pq" type="search" placeholder="Search…" value="${esc(P.q)}" aria-label="Search">`}</div>
      <div class="pool-list" id="plist">${body}</div>
      <div class="pool-note">Drag onto a day, or tap + · Costs shown for two · Times include travel to and from.</div>`;
  }
  const pool = document.getElementById("pool");
  pool.addEventListener("click", (e) => { const b = e.target.closest("#ptab button"); if (b) { P.tab = b.dataset.t; renderPool(); } });
  pool.addEventListener("change", (e) => { if (e.target.id === "pisl") { P.island = e.target.value; renderPool(); } if (e.target.id === "prate") { P.rating = e.target.value; renderPool(); } });
  pool.addEventListener("input", (e) => { if (e.target.id === "pq") { P.q = e.target.value; const pos = e.target.selectionStart; renderPool(); const q = document.getElementById("pq"); q.focus(); q.setSelectionRange(pos, pos); } });
  pool.addEventListener("submit", (e) => {
    if (e.target.id !== "custom") return; e.preventDefault();
    const f = new FormData(e.target), r = A.addCustom(+f.get("day"), { name: f.get("name"), hrs: f.get("hrs"), cost: f.get("cost") });
    UI.toast(r.msg, r.ok ? "ok" : "err"); e.target.reset();
  });

  /* ---------- days ---------- */
  const travelHtml = (r, kind, day) => {
    if (!r) return "";
    const legMins = r.legs.reduce((s, l) => s + l.mins, 0), buf = r.mins - legMins;
    const title = kind === "depart" ? `Return to Papeete for your flight home` : `${esc(iname(r.from))} → ${esc(iname(r.to))}`;
    const legs = r.legs.map((l) => `<span>${UI.modeIcon(l.mode)} ${esc(iname(l.from))} → ${esc(iname(l.to))} · ${HM.MODE_NAME[l.mode]} ${l.mins} min · ≈ ${HM.money(l.pp * 2)} for two</span>`).join("") + `<span>${UI.icons.clock} + ${HM.hours(buf)} for transfers, check-in &amp; connections</span>` + (r.legs.length === 1 ? `<span style="opacity:.85">${esc(r.legs[0].note)}</span>` : "");
    const alt = kind === "arrive" && day.alt ? `<div class="seg" style="margin-top:4px;justify-self:start">${[["fast", "Fastest"], ["value", "Cheapest"]].map((o) => `<button type="button" data-pref="${o[0]}" data-day="${day.idx}" aria-pressed="${(it().days[day.idx].pref || "fast") === o[0]}">${o[1]}</button>`).join("")}</div>` : "";
    return `<div class="travel ${kind === "depart" ? "depart" : ""}"><div class="t-head"><span class="t-title">${UI.modeIcon(r.legs[0].mode)} ${title}</span><span class="t-meta">${HM.hours(r.mins)} door to door · ≈ ${HM.money(r.pp * 2)}</span></div><div class="legs">${legs}</div>${alt}</div>`;
  };
  function dayHtml(d) {
    const raw = it().days[d.idx], date = HM.dayDate(d.idx);
    const tMins = (d.travel ? d.travel.mins : 0) + (d.depart ? d.depart.mins : 0), aMins = d.mins - tMins;
    const cls = d.mins > CAP ? "max" : d.mins > 480 ? "busy" : "";
    const flag = !d.mins ? "" : d.mins > CAP ? `<span class="flag max">Too packed</span>` : d.mins > 480 ? `<span class="flag busy">Full day</span>` : `<span class="flag ok">${tMins >= 180 ? "Travel day" : "Relaxed"}</span>`;
    const blocks = d.items.map((x) => x.t === "a"
      ? `<div class="block" ${dragAttr({ k: "block", day: d.idx, uid: x.uid })} data-uid="${x.uid}"><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.a.name)}</b><small>${HM.durHours(x.a.dur)}${x.a.tr ? " + " + x.a.tr * 2 + " min travel" : ""} · <a href="${esc(x.a.link.url)}" target="_blank" rel="noopener noreferrer">details</a></small></div><div><div class="cost">${x.cost ? HM.money(x.cost) : "free"}</div><button class="rm" type="button" data-rm="${x.uid}" data-day="${d.idx}" aria-label="Remove ${esc(x.a.name)}">${UI.icons.x}</button></div></div>`
      : `<div class="block c" ${dragAttr({ k: "block", day: d.idx, uid: x.uid })} data-uid="${x.uid}"><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.name)}</b><small>${x.hrs ? HM.durHours(x.hrs) : "no set time"}</small></div><div><div class="cost">${x.cost ? HM.money(x.cost) : "free"}</div><button class="rm" type="button" data-rm="${x.uid}" data-day="${d.idx}" aria-label="Remove">${UI.icons.x}</button></div></div>`).join("");
    const stay = d.lodging
      ? `<div class="stay-slot has" ${dragAttr({ k: "stayslot", day: d.idx })}>${UI.icons.bed}<div class="grow"><b>${esc(d.lodging.name)}</b><small>${HM.money(d.lodging.ppn)} / night · <a href="${esc(d.lodging.link.url)}" target="_blank" rel="noopener noreferrer">details</a></small></div><button class="rm block-rm" type="button" style="border:0;background:none;color:var(--muted)" data-rmstay="${d.idx}" aria-label="Remove lodging">${UI.icons.x}</button></div>`
      : `<div class="stay-slot">${UI.icons.bed}<span>${raw.island ? "Drop a place to stay tonight" : "Drop a stay or pick an island"}</span></div>`;
    const isl = HM.order.map((id) => `<option value="${id}" ${raw.island === id ? "selected" : ""}>${esc(iname(id))}</option>`).join("");
    return `<article class="day" data-day="${d.idx}"><div class="day-head">
      <div class="day-title"><h4>Day ${d.idx + 1}${date ? `<em>${date}</em>` : ""}</h4><div class="day-tools"><button class="btn sm ghost" type="button" data-clear="${d.idx}">Clear</button></div></div>
      <select data-island="${d.idx}" aria-label="Island for day ${d.idx + 1}"><option value="">Choose an island…</option>${isl}</select>
      <div class="meter ${cls}" role="img" aria-label="${HM.hours(d.mins)} planned"><i class="tr" style="width:${Math.min(100, (tMins / CAP) * 100)}%"></i><i class="ac" style="width:${Math.min(100 - Math.min(100, (tMins / CAP) * 100), (aMins / CAP) * 100)}%"></i></div>
      <div class="meter-cap"><span>${d.mins ? HM.hours(d.mins) + " planned" : "Open day"}${tMins ? ` (${HM.hours(tMins)} travel)` : ""}</span>${flag}</div></div>
      ${travelHtml(d.travel, "arrive", d)}${stay}
      <div class="blocks">${blocks || `<div class="hint">${raw.island ? "Drag activities here" : "Drag an activity here to start the day"}</div>`}</div>
      ${travelHtml(d.depart, "depart", d)}
      <div class="day-foot"><span>Day total</span><b>${HM.money(d.cost)}</b></div></article>`;
  }
  function render() {
    const trip = HM.calcTrip();
    renderBar(trip);
    document.getElementById("days").innerHTML = trip.days.map(dayHtml).join("");
  }

  /* ---------- day interactions ---------- */
  const daysEl = document.getElementById("days");
  daysEl.addEventListener("change", (e) => {
    const s = e.target.closest("[data-island]"); if (!s) return;
    const i = +s.dataset.island, d = it().days[i], val = s.value || null;
    if (val === d.island) return;
    if (!val && d.items.some((x) => x.t === "a")) { UI.toast("Remove this day's activities before clearing its island.", "err"); return render(); }
    if (val) {
      const bad = d.items.filter((x) => x.t === "a" && HM.getAct(x.id).island !== val).length + (d.lodging && HM.getStay(d.lodging).island !== val ? 1 : 0);
      if (bad && !confirm(`Switching Day ${i + 1} to ${iname(val)} removes ${bad} item${bad > 1 ? "s" : ""} that belong to ${iname(d.island)}. Continue?`)) return render();
      d.items = d.items.filter((x) => x.t === "c" || HM.getAct(x.id).island === val);
      if (d.lodging && HM.getStay(d.lodging).island !== val) d.lodging = null;
    }
    d.island = val; commit();
  });
  daysEl.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm]"), rs = e.target.closest("[data-rmstay]"), cl = e.target.closest("[data-clear]"), pf = e.target.closest("[data-pref]");
    if (rm) { const d = it().days[+rm.dataset.day]; d.items = d.items.filter((x) => x.uid !== rm.dataset.rm); commit(); }
    else if (rs) { it().days[+rs.dataset.rmstay].lodging = null; commit(); }
    else if (pf) { it().days[+pf.dataset.day].pref = pf.dataset.pref; commit(); }
    else if (cl) { const i = +cl.dataset.clear, d = it().days[i]; if ((d.items.length || d.lodging || d.island) && confirm(`Clear Day ${i + 1}?`)) { it().days[i] = { island: null, lodging: null, items: [], pref: "fast" }; commit(); } }
  });

  /* ---------- drag & drop ---------- */
  document.addEventListener("dragstart", (e) => {
    const el = e.target.closest && e.target.closest("[data-drag]"); if (!el) return;
    try { drag = JSON.parse(el.dataset.drag); } catch (x) { return; }
    e.dataTransfer.effectAllowed = "copyMove"; e.dataTransfer.setData("text/plain", el.dataset.drag);
    setTimeout(() => el.classList.add("dragging"), 0);
  });
  document.addEventListener("dragend", () => { drag = null; document.querySelectorAll(".dragging,.over").forEach((x) => x.classList.remove("dragging", "over")); });
  daysEl.addEventListener("dragover", (e) => { const d = e.target.closest(".day"); if (!d || !drag) return; e.preventDefault(); e.dataTransfer.dropEffect = drag.k === "block" || drag.k === "stayslot" ? "move" : "copy"; document.querySelectorAll(".day.over").forEach((x) => x !== d && x.classList.remove("over")); d.classList.add("over"); });
  daysEl.addEventListener("dragleave", (e) => { const d = e.target.closest(".day"); if (d && !d.contains(e.relatedTarget)) d.classList.remove("over"); });
  daysEl.addEventListener("drop", (e) => {
    const dayEl = e.target.closest(".day"); if (!dayEl || !drag) return;
    e.preventDefault(); dayEl.classList.remove("over");
    const i = +dayEl.dataset.day, d = it().days[i], blockEl = e.target.closest(".block");
    let at = null;
    if (blockEl) { at = d.items.findIndex((x) => x.uid === blockEl.dataset.uid); const r = blockEl.getBoundingClientRect(); if (e.clientY > r.top + r.height / 2) at++; }
    const k = drag.k; let res;
    if (k === "act") res = A.addAct(i, drag.id, at);
    else if (k === "stay") res = A.addStay([i], drag.id);
    else if (k === "preset") res = A.addCustom(i, PRESETS[drag.n], at);
    else if (k === "block") {
      const src = it().days[drag.day], from = src.items.findIndex((x) => x.uid === drag.uid); if (from < 0) return;
      const item = src.items[from];
      if (item.t === "a") { const a = HM.getAct(item.id); if (d.island && d.island !== a.island) res = { ok: false, msg: `Day ${i + 1} is on ${iname(d.island)}. That activity is on ${iname(a.island)}.` }; else if (!d.island) d.island = a.island; }
      if (!res) {
        src.items.splice(from, 1); if (src === d && at != null && from < at) at--;
        d.items.splice(at == null ? d.items.length : at, 0, item); commit(); res = { ok: true, msg: `Moved to Day ${i + 1}` };
      }
    } else if (k === "stayslot") {
      const src = it().days[drag.day], s = src.lodging && HM.getStay(src.lodging);
      if (s && src !== d) { if (d.island && d.island !== s.island) res = { ok: false, msg: `Day ${i + 1} is on ${iname(d.island)}.` }; else { d.island = s.island; d.lodging = src.lodging; src.lodging = null; commit(); res = { ok: true, msg: `Moved to Day ${i + 1}` }; } }
    }
    if (res) UI.toast(res.msg, res.ok ? "ok" : "err");
    drag = null;
  });

  document.addEventListener("hm:itin", render);
  document.addEventListener("hm:rating", renderPool);
  document.addEventListener("hm:itin", () => { renderSettings(); if (P.tab === "extra") renderPool(); });
  renderSettings(); renderPool(); render();
})();
