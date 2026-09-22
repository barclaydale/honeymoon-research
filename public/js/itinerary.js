/* Itinerary builder: drag & drop activities / stays / restaurants onto days, meal planning, auto travel blocks, per-day time meter, running cost. */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, A = HM.actions, esc = HM.esc;
  UI.header("itinerary");
  const it = () => S.state.itin;
  const CAP = 720; // minutes of usable day (12 h)
  const dot = (id) => `hsl(${(HM.order.indexOf(id) * 47 + 170) % 360} 52% 44%)`;
  const iname = (id) => (HM.islands[id] || { name: id }).name;
  const PRESETS = [
    { name: "Beach & pool downtime", hrs: 4, cost: 0 },
    { name: "Long lunch & lazy afternoon", hrs: 2.5, cost: 110 },
    { name: "Romantic splurge dinner", hrs: 2.5, cost: 260 },
    { name: "Rental car or scooter for the day", hrs: 0, cost: 110 }
  ];
  const picksExist = Object.values(S.state.ratings).some((v) => v === "love" || v === "like");
  const P = { tab: "acts", island: "", rating: picksExist ? "picks" : "nopass", q: "", meal: "", hidePlaced: true, hideOff: true };
  let drag = null;
  const commit = () => { S.save(); UI.refreshNav(); document.dispatchEvent(new CustomEvent("hm:itin")); };

  document.getElementById("print").innerHTML = UI.icons.print + " Print / save as PDF";
  document.getElementById("print").onclick = () => window.print();
  // blank in place (Object.assign) so bookkeeping fields the store adds to a day (e.g. its timestamp) survive
  const blank = (d) => Object.assign(d, HM.blankDay());
  const hasContent = (d) => d.items.length || d.lodging || d.island || Object.keys(d.meals || {}).length;
  document.getElementById("reset").onclick = () => { if (confirm("Clear every day, activity, stay and meal from your itinerary? Your ratings are kept.")) { S.state.itin.days.forEach(blank); commit(); } };

  /* ---------- trip bar + settings ---------- */
  function renderBar(trip) {
    const t = trip.totals, n = trip.days.reduce((s, d) => s + d.items.length, 0);
    const mealsPlanned = trip.days.reduce((s, d) => s + HM.MEALS.filter((m) => d.meals[m.k].kind === "eat").length, 0);
    const pills = trip.route.map((id) => `<i>${esc(iname(id))}</i>`).join("→");
    const chip = (l, v, tip) => `<span${tip ? ` title="${esc(tip)}"` : ""}><small>${l}</small><b>${HM.money(v)}</b></span>`;
    document.getElementById("tripbar").innerHTML = `<div class="total"><small>Estimated total · 2 travelers</small><b>${HM.money(t.all)}</b></div>
      <div class="break">${chip("International flights", t.intl, "Home ⇄ Papeete, via LAX — set the departure airport below")}${chip("Activities", t.act)}${chip("Inter-island travel", t.travel)}${chip("Places to stay", t.stay)}${chip("Meals", t.meals, "Restaurants you planned, plus the allowance for meals still open")}${chip("Extras", t.extras, "Other extras per day, counted on days that have an island")}</div>
      <div class="trip-route">${trip.route.length ? pills : "Pick an island for Day 1 to begin"} <small>· ${trip.days.length} days · ${n} planned${mealsPlanned ? " · " + mealsPlanned + " meal" + (mealsPlanned > 1 ? "s" : "") + " booked" : ""}</small></div>`;
  }
  // "3–5" -> [3,5]; a bare "4" -> [4,4]; unparseable -> null
  const nightsRange = (s) => {
    const m = String(s || "").match(/(\d+)\D+(\d+)/) || String(s || "").match(/(\d+)/);
    return m ? [+m[1], +(m[2] || m[1])] : null;
  };
  // one compact reminder card per island actually in the route: recommended length of stay + top "good to know" tips —
  // the things you'd otherwise have to go back to the island page to re-check while placing days.
  function renderIsleNotes(trip) {
    const box = document.getElementById("islenotes");
    if (!box) return;
    if (!trip.route.length) { box.innerHTML = ""; return; }
    const cards = trip.route.map((id) => {
      const isl = HM.islands[id]; if (!isl) return "";
      const m = isl.meta || {}, days = trip.daysOn[id] || 0, rng = nightsRange(m.nights);
      const short = rng && days && days < rng[0];
      const tips = (m.goodToKnow || []).slice(0, 2);
      return `<article class="isle-card">
        <div class="ic-head"><a href="island.html?i=${id}">${esc(isl.name)}</a>
          <span class="ic-days${short ? " warn" : ""}">${days} day${days === 1 ? "" : "s"} planned${m.nights ? `<small> · we'd suggest ${esc(m.nights)} nights</small>` : ""}</span></div>
        ${tips.length ? `<ul class="know">${tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <a class="ic-more" href="island.html?i=${id}">Full island notes →</a>
      </article>`;
    }).join("");
    box.innerHTML = `<h3>Planning notes for your islands</h3><div class="isle-cards">${cards}</div>`;
  }
  // re-render a region without losing the caret, focus or scroll position (sync / itin events can arrive while typing)
  function keepFocus(box, scrollSel, fn) {
    const ae = document.activeElement, fid = ae && box.contains(ae) && ae.id ? ae.id : null;
    const sel = fid && ae.selectionStart != null ? [ae.selectionStart, ae.selectionEnd] : null;
    const sc = scrollSel ? box.querySelector(scrollSel) : null, st = sc ? sc.scrollTop : 0;
    fn();
    const sc2 = scrollSel ? box.querySelector(scrollSel) : null; if (sc2 && st) sc2.scrollTop = st;
    if (fid) { const el = document.getElementById(fid); if (el) { el.focus(); if (sel) { try { el.setSelectionRange(sel[0], sel[1]); } catch (x) {} } } }
  }
  function renderSettings() {
    const i = it(), al = i.allow || {};
    const num = (id, val, step) => `<input id="${id}" class="sm-num" type="number" min="0" step="${step}" value="${Number(val) || 0}">`;
    keepFocus(document.getElementById("settings"), null, () => {
      document.getElementById("settings").innerHTML = `<div class="set-line"><label>Trip length <button class="btn sm" data-days="-1" type="button" aria-label="Remove a day">−</button><input id="ndays" type="number" min="1" max="30" value="${i.days.length}"><button class="btn sm" data-days="1" type="button" aria-label="Add a day">+</button> days</label>
        <label>${UI.icons.cal} Start date <input id="start" type="date" value="${esc(i.start)}"></label>${i.start ? `<span class="range" title="Used to flag off-season activities">${esc(HM.tripRangeLabel())}</span>` : ""}
        <label title="Adds the trip's first arrival leg and the return leg on the last day"><input id="hub" type="checkbox" ${i.hub ? "checked" : ""}> Fly in and out of Papeete (adds inter-island &amp; international arrival/return travel)</label>
        ${i.hub ? `<label>${UI.icons.plane} Flying from <select id="gateway" aria-label="Departure airport">${Object.keys(HM.GATEWAYS).map((k) => `<option value="${k}" ${i.gateway === k ? "selected" : ""}>${esc(HM.GATEWAYS[k].name)}</option>`).join("")}</select></label>` : ""}</div>
        <div class="set-line"><span class="set-t" title="What a breakfast, lunch or dinner is counted at when you haven't planned a restaurant for it (for two people)">Unplanned meal allowance for two:</span>
        <span class="allow"><label>Breakfast <b>$</b>${num("al-b", al.b, 5)}</label><label>Lunch <b>$</b>${num("al-l", al.l, 5)}</label><label>Dinner <b>$</b>${num("al-d", al.d, 5)}</label></span>
        <label>Other extras <b>$</b>${num("extras", i.extras, 10)} /day for two</label></div>
        <p class="legend">Meals included in a hotel's rate are assumed eaten at the hotel and cost $0. Drop a restaurant on a meal to plan it, or the allowance above is counted. Meals do not count toward a day's time meter.</p>`;
    });
  }
  const hasPlan = (d) => d.items.length || d.lodging || Object.values(d.meals || {}).some((m) => m && m.r);
  const setLen = (n) => {
    n = Math.max(1, Math.min(30, n | 0)); const i = it();
    if (n < i.days.length && i.days.slice(n).some(hasPlan) && !confirm(`Removing days ${n + 1}–${i.days.length} deletes what you've planned on them. Continue?`)) return renderSettings();
    if (n > i.days.length) A.ensureDays(n); else i.days.length = n; commit();
  };
  document.getElementById("settings").addEventListener("click", (e) => { const b = e.target.closest("[data-days]"); if (b) setLen(it().days.length + +b.dataset.days); });
  document.getElementById("settings").addEventListener("change", (e) => {
    const t = e.target, i = it(), amt = () => Math.max(0, Math.round(+t.value || 0));
    if (t.id === "ndays") setLen(+t.value);
    else if (t.id === "start") { i.start = t.value; commit(); }
    else if (t.id === "hub") { i.hub = t.checked; commit(); }
    else if (t.id === "gateway") { i.gateway = t.value; commit(); }
    else if (t.id === "extras") { i.extras = amt(); commit(); }
    else if (/^al-[bld]$/.test(t.id)) { i.allow = Object.assign({ b: 25, l: 45, d: 90 }, i.allow || {}); i.allow[t.id.slice(3)] = amt(); commit(); }
  });

  /* ---------- pool (left column) ---------- */
  const rateOk = (key) => { const r = S.getRating(key); return P.rating === "all" || (P.rating === "nopass" && r !== "dislike") || (P.rating === "picks" && (r === "love" || r === "like")) || (P.rating === "love" && r === "love"); };
  const dragAttr = (o) => `draggable="true" data-drag="${esc(JSON.stringify(o))}"`;
  const ratedDot = (key) => { const r = S.getRating(key); return r === "love" || r === "like" ? `<span class="rdot ${r}" title="${r === "love" ? "Loved" : "Liked"}"></span>` : ""; };
  const byIsland = (a, b) => HM.order.indexOf(a.island) - HM.order.indexOf(b.island);
  const grip = `<span class="grip">${UI.icons.grip}</span>`;
  const miniAdd = (kind, x, label) => `<button class="mini-add" type="button" data-add="${kind}" data-id="${esc(x.id)}" aria-label="${label} ${esc(x.name)}">${UI.icons.plus}</button>`;
  const opt = (v, l, cur) => `<option value="${v}" ${v === cur ? "selected" : ""}>${l}</option>`;
  const chk = (id, on, label) => `<label class="check"><input type="checkbox" id="${id}" ${on ? "checked" : ""}> ${label}</label>`;
  let poolTab = null;   // which tab the pool last rendered (to keep scroll position only when it is the same one)

  function poolBody() {
    const q = P.q.trim().toLowerCase(), match = (x) => (!P.island || x.island === P.island) && (!q || (x.name + " " + iname(x.island)).toLowerCase().includes(q));
    if (P.tab === "acts") {
      const all = Object.values(HM.acts).filter((x) => match(x) && rateOk("a:" + x.id));
      const rows = all.filter((x) => !(P.hidePlaced && HM.placedDays("a", x.id).length) && !(P.hideOff && HM.season(x.mo) === "out"))
        .sort((a, b) => byIsland(a, b) || b.pop - a.pop);
      const hidden = all.length - rows.length;
      return rows.map((x) => {
        const placed = HM.placedDays("a", x.id).length, off = HM.season(x.mo) === "out";
        return `<div class="pitem${placed ? " is-placed" : ""}${off ? " off" : ""}" data-id="${esc(x.id)}" ${dragAttr({ k: "act", id: x.id })}>${grip}<div><b>${esc(x.name)}</b><small>${ratedDot("a:" + x.id)}${esc(iname(x.island))} · ${HM.hours(HM.actMins(x))} · ${x.pp ? HM.money(x.pp * 2) : "free"}</small>${placed || off ? `<span class="pline">${off ? UI.seasonBadge(x.mo) : ""}${UI.placedBadge("a", x.id)}</span>` : ""}</div>${miniAdd("act", x, "Add")} </div>`;
      }).join("") || emptyMsg("activities", hidden);
    }
    if (P.tab === "stay") {
      const rows = Object.values(HM.stays).filter((x) => match(x) && rateOk("s:" + x.id)).sort((a, b) => byIsland(a, b) || a.ppn - b.ppn);
      return rows.map((x) => {
        const placed = HM.placedDays("s", x.id).length, inc = x.meals ? HM.mealList(x.meals).map((w) => w[0].toUpperCase()).join("") : "";
        return `<div class="pitem${placed ? " is-placed" : ""}" data-id="${esc(x.id)}" ${dragAttr({ k: "stay", id: x.id })}>${grip}<div><b>${esc(x.name)}</b><small>${ratedDot("s:" + x.id)}${esc(iname(x.island))} · ${HM.money(x.ppn)}/night${inc ? ` · meals: ${inc}` : ""}</small>${placed ? `<span class="pline">${UI.placedBadge("s", x.id)}</span>` : ""}</div>${miniAdd("stay", x, "Set")}</div>`;
      }).join("") || emptyMsg("stays", 0);
    }
    if (P.tab === "eat") {
      if (!Object.keys(HM.eats).length) return `<p class="pool-empty">Restaurants are still being added. Check back soon.</p>`;
      const all = Object.values(HM.eats).filter((x) => match(x) && rateOk("r:" + x.id) && (!P.meal || x.meals.includes(P.meal)));
      const rows = all.filter((x) => !(P.hidePlaced && HM.placedDays("e", x.id).length)).sort((a, b) => byIsland(a, b) || a.pp - b.pp);
      return rows.map((x) => {
        const placed = HM.placedDays("e", x.id).length;
        return `<div class="pitem${placed ? " is-placed" : ""}" data-id="${esc(x.id)}" ${dragAttr({ k: "eat", id: x.id })}>${grip}<div><b>${esc(x.name)}</b><small>${ratedDot("r:" + x.id)}${esc(iname(x.island))} · ≈ ${HM.money(x.pp)} pp${x.tr ? ` · ${x.tr} min each way` : ""}</small><span class="pline"><span class="mps">${UI.mealPills(x.meals)}</span>${placed ? UI.placedBadge("e", x.id) : ""}</span></div>${miniAdd("eat", x, "Plan a meal at")}</div>`;
      }).join("") || emptyMsg("restaurants", all.length - rows.length);
    }
    return PRESETS.map((p, n) => `<div class="pitem" ${dragAttr({ k: "preset", n })}>${grip}<div><b>${esc(p.name)}</b><small>${p.hrs ? HM.durHours(p.hrs) : "no time"} · ${p.cost ? HM.money(p.cost) : "no cost"}</small></div><span></span></div>`).join("") +
      `<form id="custom" class="pitem" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;cursor:default"><b style="grid-column:1/-1">Your own block</b><input name="name" placeholder="e.g. Sunset photoshoot" required style="grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><input name="hrs" type="number" step="0.5" min="0" placeholder="Hours" style="border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><input name="cost" type="number" min="0" placeholder="$ for two" style="border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit"><select name="day" style="grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font:inherit">${it().days.map((_, i) => `<option value="${i}">Day ${i + 1}</option>`).join("")}</select><button class="btn sm primary" style="grid-column:1/-1;justify-content:center" type="submit">Add to day</button></form>`;
  }
  function emptyMsg(what, hidden) {
    if (hidden) return `<p class="pool-empty">All the matching ${what} are already in your itinerary or off-season. Untick the boxes above to see them.</p>`;
    return `<p class="pool-empty">${P.rating === "picks" ? `Nothing here yet. Love or like ${what} on the island pages, or switch the filter above to “Everything except passed”.` : "No matches."}</p>`;
  }
  function renderPool() {
    const box = document.getElementById("pool"), same = poolTab === P.tab;
    poolTab = P.tab; P.days = it().days.length;
    keepFocus(box, same ? "#plist" : null, () => {
      const T = P.tab;
      const rating = `<select id="prate" aria-label="Rating filter">${opt("picks", "My picks (♥ loved + 👍 liked)", P.rating)}${opt("love", "Only ♥ loved", P.rating)}${opt("nopass", "Everything except passed", P.rating)}${opt("all", "Everything", P.rating)}</select>`;
      const isl = `<select id="pisl" aria-label="Island">${opt("", "All islands", P.island)}${HM.order.map((id) => opt(id, iname(id), P.island)).join("")}</select>`;
      const meal = `<select id="pmeal" aria-label="Meal">${opt("", "Any meal", P.meal)}${HM.MEALS.map((m) => opt(m.k, m.label, P.meal)).join("")}</select>`;
      const search = `<input id="pq" type="search" placeholder="Search…" value="${esc(P.q)}" aria-label="Search">`;
      const checks = T === "acts" ? `<div class="checks">${chk("phide", P.hidePlaced, "Hide items already in my itinerary")}${chk("poff", P.hideOff, "Hide off-season for my dates")}</div>` : T === "eat" ? `<div class="checks">${chk("phide", P.hidePlaced, "Hide items already in my itinerary")}</div>` : "";
      const filters = T === "extra" ? "" : (T === "eat" ? `<div class="row2">${isl}${meal}</div>` : isl) + rating + search + checks;
      const note = T === "eat" ? "Drag onto a meal (or anywhere on a day), or tap + · Costs are per person · Travel time is one way." : "Drag onto a day, or tap + · Costs shown for two · Times include travel to and from.";
      box.innerHTML = `<div class="pool-head"><div class="seg" id="ptab">${[["acts", "Activities"], ["stay", "Stays"], ["eat", "Dining"], ["extra", "Extras"]].map((t) => `<button type="button" data-t="${t[0]}" aria-pressed="${T === t[0]}">${t[1]}</button>`).join("")}</div>${filters}</div>
        <div class="pool-list" id="plist">${poolBody()}</div><div class="pool-note">${note}</div>`;
    });
  }
  const pool = document.getElementById("pool");
  pool.addEventListener("click", (e) => { const b = e.target.closest("#ptab button"); if (b) { P.tab = b.dataset.t; renderPool(); } });
  pool.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "pisl") P.island = t.value; else if (t.id === "prate") P.rating = t.value; else if (t.id === "pmeal") P.meal = t.value;
    else if (t.id === "phide") P.hidePlaced = t.checked; else if (t.id === "poff") P.hideOff = t.checked; else return;
    renderPool();
  });
  pool.addEventListener("input", (e) => { if (e.target.id === "pq") { P.q = e.target.value; renderPool(); } });
  pool.addEventListener("submit", (e) => {
    if (e.target.id !== "custom") return; e.preventDefault();
    const f = new FormData(e.target), r = A.addCustom(+f.get("day"), { name: f.get("name"), hrs: f.get("hrs"), cost: f.get("cost") });
    UI.toast(r.msg, r.ok ? "ok" : "err"); e.target.reset();
  });

  /* ---------- days ---------- */
  const travelHtml = (r, kind, day) => {
    if (!r) return "";
    const legMins = r.legs.reduce((s, l) => s + l.mins, 0), buf = r.mins - legMins;
    const title = kind === "depart" ? `Return to Papeete for your flight home`
      : kind === "gwout" ? `Fly in: ${esc(r.gateway)} → Tahiti`
      : kind === "gwback" ? `Fly home: Tahiti → ${esc(r.gateway)}`
      : `${esc(iname(r.from))} → ${esc(iname(r.to))}`;
    const legs = r.legs.map((l) => `<span>${UI.modeIcon(l.mode)} ${esc(iname(l.from))} → ${esc(iname(l.to))} · ${HM.MODE_NAME[l.mode]} ${l.mins} min · ≈ ${HM.money(l.pp * 2)} for two</span>`).join("") + `<span>${UI.icons.clock} + ${HM.hours(buf)} for transfers, check-in &amp; connections</span>` + (r.legs.length === 1 ? `<span style="opacity:.85">${esc(r.legs[0].note)}</span>` : "");
    const alt = kind === "arrive" && day.alt ? `<div class="seg" style="margin-top:4px;justify-self:start">${[["fast", "Fastest"], ["value", "Cheapest"]].map((o) => `<button type="button" data-pref="${o[0]}" data-day="${day.idx}" aria-pressed="${(it().days[day.idx].pref || "fast") === o[0]}">${o[1]}</button>`).join("")}</div>` : "";
    return `<div class="travel ${kind === "depart" || kind === "gwback" ? "depart" : ""}"><div class="t-head"><span class="t-title">${UI.modeIcon(r.legs[0].mode)} ${title}</span><span class="t-meta">${HM.hours(r.mins)} door to door · ≈ ${HM.money(r.pp * 2)}</span></div><div class="legs">${legs}</div>${alt}</div>`;
  };
  /* one compact, drop-able row per meal; what it shows depends on calcTrip's meal `kind` */
  const mact = (label, act, d, k, cls) => `<button class="${cls || "mbtn"}" type="button" data-mact="${act}" data-day="${d.idx}" data-m="${k}">${label}</button>`;
  function mealRow(d, k, label) {
    const m = d.meals[k], word = HM.MEAL_WORD[k]; let body = "", act = "", tip = "";
    if (m.kind === "hotel") {
      body = `<span class="m-t">Included at <b>${esc(m.host.name)}</b></span>`; act = mact("Eat elsewhere", "out", d, k);
      tip = k === "b" ? "Breakfast is included at last night's hotel" : `${label} is included in tonight's rate`;
    } else if (m.kind === "eat") {
      const e = m.e;
      body = `<span class="m-t"><a class="m-name" href="${esc(e.link.url)}" target="_blank" rel="noopener noreferrer">${esc(e.name)}</a>${m.override ? ` <em class="m-ov">instead of the hotel meal</em>` : ""}<small>≈ ${HM.money(m.cost)} for two · ${e.tr ? "≈ " + e.tr + " min each way" : "on site"}</small></span>`;
      act = `<button class="m-x" type="button" data-mact="clear" data-day="${d.idx}" data-m="${k}" aria-label="Remove ${esc(e.name)} from ${word}" title="${m.override ? "Back to the hotel meal" : "Remove"}">${UI.icons.x}</button>`;
    } else if (m.kind === "skip") {
      body = `<span class="m-t">Skipped</span>`; act = mact("Undo", "clear", d, k);
    } else if (m.kind === "out") {
      body = `<span class="m-t">Eating out: drop a restaurant here <small>≈ ${HM.money(m.cost)} planned</small></span>`; act = m.hostHas ? mact("Use hotel meal", "clear", d, k) : mact("Clear", "clear", d, k);
    } else if (m.kind === "open") {
      body = `<span class="m-t">Drop a restaurant · ≈ ${HM.money(m.cost)} planned</span>`; act = mact("Skip", "skip", d, k);
    } else body = `<span class="m-t">Choose an island to plan meals</span>`;
    return `<div class="meal ${m.kind}" data-meal="${k}"${tip ? ` title="${esc(tip)}"` : ""}><span class="m-l">${label}</span>${body}${act}</div>`;
  }
  function dayHtml(d) {
    const raw = it().days[d.idx], date = HM.dayDate(d.idx);
    const tMins = (d.travel ? d.travel.mins : 0) + (d.depart ? d.depart.mins : 0) + (d.gwOut ? d.gwOut.mins : 0) + (d.gwBack ? d.gwBack.mins : 0), aMins = d.mins - tMins;
    const cls = d.mins > CAP ? "max" : d.mins > 480 ? "busy" : "";
    const flag = !d.mins ? "" : d.mins > CAP ? `<span class="flag max">Too packed</span>` : d.mins > 480 ? `<span class="flag busy">Full day</span>` : `<span class="flag ok">${tMins >= 180 ? "Travel day" : "Relaxed"}</span>`;
    const blocks = d.items.map((x) => x.t === "a"
      ? `<div class="block" ${dragAttr({ k: "block", day: d.idx, uid: x.uid })} data-uid="${x.uid}"><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.a.name)}</b><small>${HM.durHours(x.a.dur)}${x.a.tr ? " + " + x.a.tr * 2 + " min travel" : ""} · <a href="${esc(x.a.link.url)}" target="_blank" rel="noopener noreferrer">details</a>${HM.season(x.a.mo) === "out" ? UI.seasonBadge(x.a.mo) : ""}</small></div><div><div class="cost">${x.cost ? HM.money(x.cost) : "free"}</div><button class="rm" type="button" data-rm="${x.uid}" data-day="${d.idx}" aria-label="Remove ${esc(x.a.name)}">${UI.icons.x}</button></div></div>`
      : `<div class="block c" ${dragAttr({ k: "block", day: d.idx, uid: x.uid })} data-uid="${x.uid}"><span class="grip">${UI.icons.grip}</span><div><b>${esc(x.name)}</b><small>${x.hrs ? HM.durHours(x.hrs) : "no set time"}</small></div><div><div class="cost">${x.cost ? HM.money(x.cost) : "free"}</div><button class="rm" type="button" data-rm="${x.uid}" data-day="${d.idx}" aria-label="Remove">${UI.icons.x}</button></div></div>`).join("");
    const stay = d.lodging
      ? `<div class="stay-slot has" ${dragAttr({ k: "stayslot", day: d.idx })}>${UI.icons.bed}<div class="grow"><b>${esc(d.lodging.name)}</b><small>${HM.money(d.lodging.ppn)} / night${d.lodging.meals ? " · " + esc(HM.mealList(d.lodging.meals).join(", ")) + " included" : ""} · <a href="${esc(d.lodging.link.url)}" target="_blank" rel="noopener noreferrer">details</a></small></div><button class="rm block-rm" type="button" style="border:0;background:none;color:var(--muted)" data-rmstay="${d.idx}" aria-label="Remove lodging">${UI.icons.x}</button></div>`
      : `<div class="stay-slot">${UI.icons.bed}<span>${raw.island ? "Drop a place to stay tonight" : "Drop a stay or pick an island"}</span></div>`;
    const meals = `<div class="meals" title="Meals are costed but do not count toward the day's time meter">${HM.MEALS.map((m) => mealRow(d, m.k, m.label)).join("")}</div>`;
    const isl = HM.order.map((id) => `<option value="${id}" ${raw.island === id ? "selected" : ""}>${esc(iname(id))}</option>`).join("");
    const extras = d.island ? Number(it().extras) || 0 : 0;
    return `<article class="day" data-day="${d.idx}"><div class="day-head">
      <div class="day-title"><h4>Day ${d.idx + 1}${date ? `<em>${date}</em>` : ""}</h4><div class="day-tools"><button class="btn sm ghost" type="button" data-clear="${d.idx}">Clear</button></div></div>
      <select data-island="${d.idx}" aria-label="Island for day ${d.idx + 1}"><option value="">Choose an island…</option>${isl}</select>
      <div class="meter ${cls}" role="img" aria-label="${HM.hours(d.mins)} planned" title="Time planned: activities and travel. Meals are not counted."><i class="tr" style="width:${Math.min(100, (tMins / CAP) * 100)}%"></i><i class="ac" style="width:${Math.min(100 - Math.min(100, (tMins / CAP) * 100), (aMins / CAP) * 100)}%"></i></div>
      <div class="meter-cap"><span>${d.mins ? HM.hours(d.mins) + " planned" : "Open day"}${tMins ? ` (${HM.hours(tMins)} travel)` : ""}</span>${flag}</div></div>
      ${travelHtml(d.gwOut, "gwout", d)}${travelHtml(d.travel, "arrive", d)}${stay}${meals}
      <div class="blocks">${blocks || `<div class="hint">${raw.island ? "Drag activities here" : "Drag an activity here to start the day"}</div>`}</div>
      ${travelHtml(d.depart, "depart", d)}${travelHtml(d.gwBack, "gwback", d)}
      <div class="day-foot"><span class="f-l"><span>Day total</span>${d.island ? `<small>meals ${d.costs.meals ? "≈ " + HM.money(d.costs.meals) : "$0"}${extras ? ` · extras ${HM.money(extras)}` : ""}</small>` : ""}</span><b>${HM.money(d.cost)}</b></div></article>`;
  }
  function render() {
    const trip = HM.calcTrip();
    renderBar(trip);
    renderIsleNotes(trip);
    document.getElementById("days").innerHTML = trip.days.map(dayHtml).join("");
  }

  /* ---------- day interactions ---------- */
  const daysEl = document.getElementById("days");
  const eatsOff = (d, isl) => Object.keys(d.meals || {}).filter((k) => d.meals[k] && d.meals[k].r && (!HM.getEat(d.meals[k].r) || HM.getEat(d.meals[k].r).island !== isl));
  daysEl.addEventListener("change", (e) => {
    const s = e.target.closest("[data-island]"); if (!s) return;
    const i = +s.dataset.island, d = it().days[i], val = s.value || null;
    if (val === d.island) return;
    if (!val && (d.items.some((x) => x.t === "a") || d.lodging || eatsOff(d, null).length)) { UI.toast("Remove this day's activities, stay and restaurants before clearing its island.", "err"); return render(); }
    if (val) {
      const off = eatsOff(d, val);
      const bad = d.items.filter((x) => x.t === "a" && HM.getAct(x.id).island !== val).length + (d.lodging && HM.getStay(d.lodging).island !== val ? 1 : 0) + off.length;
      if (bad && !confirm(`Switching Day ${i + 1} to ${iname(val)} removes ${bad} item${bad > 1 ? "s" : ""} that belong to ${iname(d.island)}. Continue?`)) return render();
      d.items = d.items.filter((x) => x.t === "c" || HM.getAct(x.id).island === val);
      if (d.lodging && HM.getStay(d.lodging).island !== val) d.lodging = null;
      off.forEach((k) => delete d.meals[k]);
    }
    d.island = val; commit();
  });
  daysEl.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm]"), rs = e.target.closest("[data-rmstay]"), cl = e.target.closest("[data-clear]"), pf = e.target.closest("[data-pref]"), ma = e.target.closest("[data-mact]");
    if (ma) { const i = +ma.dataset.day, k = ma.dataset.m, act = ma.dataset.mact; A.setMeal(i, k, act === "out" ? { out: true } : act === "skip" ? { skip: true } : null); }
    else if (rm) { const d = it().days[+rm.dataset.day]; d.items = d.items.filter((x) => x.uid !== rm.dataset.rm); commit(); }
    else if (rs) { it().days[+rs.dataset.rmstay].lodging = null; commit(); }
    else if (pf) { it().days[+pf.dataset.day].pref = pf.dataset.pref; commit(); }
    else if (cl) { const i = +cl.dataset.clear, d = it().days[i]; if (hasContent(d) && confirm(`Clear Day ${i + 1}?`)) { blank(d); commit(); } }
  });

  /* ---------- drag & drop ---------- */
  const clearOver = () => document.querySelectorAll(".day.over,.meal.mover").forEach((x) => x.classList.remove("over", "mover"));
  document.addEventListener("dragstart", (e) => {
    const el = e.target.closest && e.target.closest("[data-drag]"); if (!el) return;
    try { drag = JSON.parse(el.dataset.drag); } catch (x) { return; }
    e.dataTransfer.effectAllowed = "copyMove"; e.dataTransfer.setData("text/plain", el.dataset.drag);
    setTimeout(() => el.classList.add("dragging"), 0);
  });
  document.addEventListener("dragend", () => { drag = null; document.querySelectorAll(".dragging").forEach((x) => x.classList.remove("dragging")); clearOver(); });
  daysEl.addEventListener("dragover", (e) => {
    const d = e.target.closest(".day"); if (!d || !drag) return; e.preventDefault();
    e.dataTransfer.dropEffect = drag.k === "block" || drag.k === "stayslot" ? "move" : "copy";
    const m = drag.k === "eat" ? e.target.closest(".meal") : null;
    document.querySelectorAll(".day.over").forEach((x) => x !== d && x.classList.remove("over"));
    document.querySelectorAll(".meal.mover").forEach((x) => x !== m && x.classList.remove("mover"));
    if (m) { m.classList.add("mover"); d.classList.remove("over"); } else d.classList.add("over");
  });
  daysEl.addEventListener("dragleave", (e) => {
    const d = e.target.closest(".day"); if (d && !d.contains(e.relatedTarget)) { d.classList.remove("over"); d.querySelectorAll(".mover").forEach((x) => x.classList.remove("mover")); }
    const m = e.target.closest(".meal"); if (m && !m.contains(e.relatedTarget)) m.classList.remove("mover");
  });
  daysEl.addEventListener("drop", (e) => {
    const dayEl = e.target.closest(".day"); if (!dayEl || !drag) return;
    e.preventDefault(); clearOver();
    const i = +dayEl.dataset.day, d = it().days[i], blockEl = e.target.closest(".block"), mealEl = e.target.closest(".meal");
    let at = null;
    if (blockEl) { at = d.items.findIndex((x) => x.uid === blockEl.dataset.uid); const r = blockEl.getBoundingClientRect(); if (e.clientY > r.top + r.height / 2) at++; }
    const k = drag.k; let res;
    if (k === "act") res = A.addAct(i, drag.id, at);
    else if (k === "stay") res = A.addStay([i], drag.id);
    else if (k === "eat") res = mealEl ? A.addEat(i, mealEl.dataset.meal, drag.id) : A.addEatAuto(i, drag.id);
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

  /* ---------- re-render triggers ---------- */
  const refreshPool = () => { if (P.tab !== "extra" || P.days !== it().days.length) renderPool(); };   // don't wipe a half-typed custom block
  document.addEventListener("hm:itin", () => { render(); renderSettings(); refreshPool(); });
  document.addEventListener("hm:rating", () => { if (P.tab !== "extra") renderPool(); });
  document.addEventListener("hm:sync", () => { UI.refreshNav(); renderSettings(); renderPool(); render(); });   // remote changes were merged into the store
  renderSettings(); renderPool(); render();
})();
