/* Home: island cards + combined filters (budget, crowds, pace, terrain, activities, my picks). */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, esc = HM.esc;
  UI.header("home");
  const F = { q: "", cost: new Set(), vibe: new Set(), pace: new Set(), terr: new Set(), tags: new Set(), mode: "all", mine: "all" };
  const isls = () => HM.order.map((id) => HM.islands[id]);

  // search icon (placeholder in markup)
  document.querySelector(".search").innerHTML = document.querySelector(".search").innerHTML.replace("__SEARCH__", UI.icons.search);

  /* hero */
  const hero = HM.islands.borabora || isls()[0];
  if (hero) document.getElementById("hero-art").innerHTML = UI.art(hero, { huts: true });
  const nAct = Object.keys(HM.acts).length, nStay = Object.keys(HM.stays).length, nEat = Object.keys(HM.eats).length;
  document.getElementById("hero-stats").innerHTML = [[HM.order.length, "Islands"], [nAct, "Activities"], [nStay, "Places to stay"]].concat(nEat ? [[nEat, "Restaurants"]] : []).map((x) => `<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join("");

  /* combos */
  document.getElementById("combos").innerHTML = HM.COMBOS.map((c) => {
    const seq = []; c.days.forEach((d) => { if (seq[seq.length - 1] !== d) seq.push(d); });
    return `<div class="combo"><h4>${esc(c.name)}</h4><p>${esc(c.blurb)}</p><div class="route">${c.days.length} days · ${seq.map((d) => esc((HM.islands[d] || { name: d }).name)).join(" → ")}</div><button class="btn sm" data-combo="${c.id}" type="button">Load into itinerary</button></div>`;
  }).join("");
  document.getElementById("combos").addEventListener("click", (e) => {
    const b = e.target.closest("[data-combo]"); if (!b) return;
    const c = HM.COMBOS.find((x) => x.id === b.dataset.combo), it = S.state.itin;
    const dirty = it.days.some((d) => d.items.length || d.lodging);
    if (dirty && !confirm("This replaces the islands on your itinerary. Days you've filled in will keep their activities only if they still match the island; the rest are cleared. Continue?")) return;
    const old = it.days;
    it.days = c.days.map((isl, i) => { const o = old[i]; const keep = o && o.island === isl; return Object.assign(HM.blankDay(), { island: isl, lodging: keep ? o.lodging : null, items: keep ? o.items : [], meals: keep && o.meals ? o.meals : {} }); });
    S.save(); location.href = "itinerary.html";
  });

  /* filter chips */
  const countBy = (fn) => { const m = {}; isls().forEach((i) => { const k = fn(i); m[k] = (m[k] || 0) + 1; }); return m; };
  const chipGroup = (key, title, opts, counts) => `<div class="fg"><h4>${title}</h4><div class="chips" data-group="${key}">${opts.map((o) => `<button type="button" class="chip" data-val="${esc(o.v)}" aria-pressed="false">${esc(o.l)} <small>${counts[o.v] || 0}</small></button>`).join("")}</div></div>`;
  document.getElementById("f-groups").innerHTML =
    chipGroup("cost", "Budget", [1, 2, 3, 4].map((v) => ({ v, l: HM.COST_LABELS[v] })), countBy((i) => i.cost)) +
    chipGroup("vibe", "Crowds & vibe", HM.VIBES.map((v) => ({ v, l: v })), countBy((i) => i.vibe)) +
    chipGroup("pace", "Pace", HM.PACES.map((v) => ({ v, l: v })), countBy((i) => i.pace)) +
    chipGroup("terr", "Landscape", HM.TERRAINS.map((v) => ({ v, l: v === "Atoll" ? "Atoll (flat, lagoon-only)" : "High island (volcanic peaks)" })), countBy((i) => i.terrain));
  const tagCounts = {}; isls().forEach((i) => { const s = new Set(); i.activities.forEach((a) => a.tags.forEach((t) => s.add(t))); s.forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)); });
  document.getElementById("f-tags").innerHTML = Object.keys(HM.ACT_TAGS).filter((t) => tagCounts[t]).sort((a, b) => tagCounts[b] - tagCounts[a]).map((t) => `<button type="button" class="chip" data-val="${t}" aria-pressed="false">${HM.ACT_TAGS[t]} <small>${tagCounts[t]}</small></button>`).join("");
  const mineOpts = [["all", "All islands"], ["fav", "My favorite islands"], ["acts", "Have activities I picked"], ["hide", "Hide passed"]];
  document.getElementById("f-mine").innerHTML = mineOpts.map((o) => `<button type="button" data-mine="${o[0]}" aria-pressed="${o[0] === "all"}">${o[1]}</button>`).join("");

  /* events */
  const toggle = (set, v) => (set.has(v) ? set.delete(v) : set.add(v));
  document.getElementById("f-groups").addEventListener("click", (e) => {
    const b = e.target.closest("button.chip"); if (!b) return;
    const g = b.parentElement.dataset.group, v = g === "cost" ? +b.dataset.val : b.dataset.val;
    toggle(F[g], v); b.setAttribute("aria-pressed", F[g].has(v)); render();
  });
  document.getElementById("f-tags").addEventListener("click", (e) => { const b = e.target.closest("button.chip"); if (!b) return; toggle(F.tags, b.dataset.val); b.setAttribute("aria-pressed", F.tags.has(b.dataset.val)); render(); });
  document.getElementById("f-mode").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; F.mode = b.dataset.mode; document.querySelectorAll("#f-mode button").forEach((x) => x.setAttribute("aria-pressed", x === b)); render(); });
  document.getElementById("f-mine").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; F.mine = b.dataset.mine; document.querySelectorAll("#f-mine button").forEach((x) => x.setAttribute("aria-pressed", x === b)); render(); });
  document.getElementById("q").addEventListener("input", (e) => { F.q = e.target.value.trim().toLowerCase(); render(); });
  document.getElementById("clear").addEventListener("click", () => {
    ["cost", "vibe", "pace", "terr", "tags"].forEach((k) => F[k].clear()); F.q = ""; F.mine = "all"; F.mode = "all";
    document.getElementById("q").value = "";
    document.querySelectorAll(".finder .chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
    document.querySelectorAll("#f-mine button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.mine === "all"));
    document.querySelectorAll("#f-mode button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.mode === "all"));
    render();
  });
  document.addEventListener("hm:rating", () => { if (F.mine !== "all") render(); else refreshPicks(); });

  /* matching */
  function myActs(isl) { let l = 0, k = 0; isl.activities.forEach((a) => { const r = S.getRating("a:" + a.id); if (r === "love") l++; else if (r === "like") k++; }); return { l, k }; }
  function match(isl) {
    if (F.cost.size && !F.cost.has(isl.cost)) return null;
    if (F.vibe.size && !F.vibe.has(isl.vibe)) return null;
    if (F.pace.size && !F.pace.has(isl.pace)) return null;
    if (F.terr.size && !F.terr.has(isl.terrain)) return null;
    let acts = null;
    if (F.tags.size) {
      const per = [...F.tags].map((t) => isl.activities.filter((a) => a.tags.includes(t)));
      if (!(F.mode === "all" ? per.every((x) => x.length) : per.some((x) => x.length))) return null;
      acts = [...new Set(per.flat())];
      if (F.mode === "all") acts = acts.filter((a) => [...F.tags].every((t) => a.tags.includes(t))).concat(acts.filter((a) => ![...F.tags].every((t) => a.tags.includes(t))));
    }
    if (F.q) {
      const text = [isl.name, isl.group, isl.tagline, isl.short, isl.unique, isl.vibe, isl.pace, isl.terrain].join(" ").toLowerCase();
      const pool = acts || isl.activities, hit = pool.filter((a) => (a.name + " " + a.desc + " " + a.tags.map((t) => HM.ACT_TAGS[t]).join(" ")).toLowerCase().includes(F.q));
      if (!text.includes(F.q) && !hit.length) return null;
      if (hit.length && !text.includes(F.q)) acts = hit; else if (hit.length && acts) acts = hit;
    }
    const r = S.getRating("i:" + isl.id), mine = myActs(isl);
    if (F.mine === "fav" && !(r === "love" || r === "like")) return null;
    if (F.mine === "acts" && !(mine.l + mine.k)) return null;
    if (F.mine === "hide" && r === "dislike") return null;
    if (acts) acts.sort((a, b) => b.pop - a.pop);
    return { acts };
  }

  /* render */
  const routeLine = (isl) => {
    if (isl.id === "tahiti") return `<span>${UI.icons.plane} Gateway island · international airport</span>`;
    const r = HM.route("tahiti", isl.id, "fast"); if (!r) return "";
    const modes = [...new Set(r.legs.map((l) => HM.MODE_NAME[l.mode].toLowerCase()))].join(" + ");
    return `<span>${UI.icons.plane} From Papeete: ≈ ${HM.hours(r.mins)} door to door (${modes}${r.legs.length > 1 ? ", via " + HM.islands[r.legs[0].to].name : ""})</span>`;
  };
  const sentences = (t, n) => { const p = String(t).match(/[^.!?]+[.!?]+(?:\s+|$)/g); if (!p) return t; let out = p.slice(0, n).join("").trim(); if (n > 1 && out.length > 230) out = p[0].trim(); return out; };
  function card(isl, m) {
    const mine = myActs(isl), r = S.getRating("i:" + isl.id);
    const top = Object.entries(isl.activities.reduce((o, a) => (a.tags.forEach((t) => (o[t] = (o[t] || 0) + 1)), o), {})).sort((a, b) => b[1] - a[1]).slice(0, 4).map((x) => HM.ACT_TAGS[x[0]]);
    const matches = m.acts && m.acts.length ? `<div class="matches"><b>${m.acts.length} match${m.acts.length > 1 ? "es" : ""}:</b> ${m.acts.slice(0, 3).map((a) => esc(a.name)).join(" · ")}${m.acts.length > 3 ? ` · +${m.acts.length - 3} more` : ""}</div>` : "";
    return `<article class="icard ${r === "dislike" ? "passed" : ""}" data-id="${isl.id}" data-href="island.html?i=${isl.id}" tabindex="0" aria-label="${esc(isl.name)}">
      <div class="icard-art">${UI.art(isl)}<span class="group">${esc(isl.group)}</span></div>
      <div class="icard-body">
        <div><h3><a href="island.html?i=${isl.id}">${esc(isl.name)}</a></h3></div>
        <p class="tagline">${esc(isl.tagline)}</p>
        <div class="chips"><span class="chip cost" title="${HM.COST_HINT[isl.cost]}"><b>${"$".repeat(isl.cost)}</b> ${HM.COST_LABELS[isl.cost]}</span><span class="chip vibe">${esc(isl.vibe)}</span><span class="chip pace">${esc(isl.pace)}</span><span class="chip terr">${esc(isl.terrain)}</span></div>
        <p class="short">${esc(sentences(isl.short, 2))}</p>
        <div class="unique"><h5>What makes it different</h5><p>${esc(sentences(isl.unique, 1))}</p></div>
        <div class="chips">${top.map((t) => `<span class="chip tag">${esc(t)}</span>`).join("")}</div>
        <div class="stats">${routeLine(isl)}<span>${isl.activities.length} activities · ${isl.lodging.length} stays${isl.eats.length ? " · " + isl.eats.length + " restaurants" : ""}</span></div>
        ${matches}
        <div class="icard-foot"><div class="picks" data-picks="${isl.id}">${picksHtml(mine)}</div>${UI.rate("i:" + isl.id, false)}</div>
      </div></article>`;
  }
  const picksHtml = (m) => (m.l || m.k ? `<span class="l">♥ ${m.l}</span><span class="k">👍 ${m.k}</span><span>activities picked</span>` : `<span>Rate the island, then open it to pick activities</span>`);
  function refreshPicks() { document.querySelectorAll("[data-picks]").forEach((el) => (el.innerHTML = picksHtml(myActs(HM.islands[el.dataset.picks])))); }

  function render() {
    const out = [];
    isls().forEach((i) => { const m = match(i); if (m) out.push([i, m]); });
    const grid = document.getElementById("grid");
    grid.innerHTML = out.length ? out.map(([i, m]) => card(i, m)).join("") : `<div class="empty"><h3>No islands match all of that</h3><p>Try switching to “Match any”, or clear a filter or two.</p></div>`;
    document.getElementById("result-count").innerHTML = `Showing <b>${out.length}</b> of ${HM.order.length} islands`;
  }
  // whole card is clickable (rating buttons stop propagation in ui.js)
  document.getElementById("grid").addEventListener("click", (e) => { const c = e.target.closest(".icard"); if (c && !e.target.closest("a")) location.href = c.dataset.href; });
  document.getElementById("grid").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.classList.contains("icard")) location.href = e.target.dataset.href; });
  document.addEventListener("hm:sync", () => { render(); });
  render();
})();
