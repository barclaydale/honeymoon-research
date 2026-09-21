/* Island detail page: overview + Activities / Stays toggle with rich filtering. */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, esc = HM.esc;
  UI.header("home");
  const app = document.getElementById("app");
  const id = new URLSearchParams(location.search).get("i"), isl = HM.islands[id];
  if (!isl) {
    app.innerHTML = `<main class="wrap"><div class="empty" style="margin-top:40px"><h3>We couldn't find that island</h3><p><a href="index.html">← Back to all islands</a></p></div></main>`;
    return;
  }
  document.title = isl.name + " · Tiare & Tide";
  const idx = HM.order.indexOf(id), prev = HM.islands[HM.order[(idx + HM.order.length - 1) % HM.order.length]], next = HM.islands[HM.order[(idx + 1) % HM.order.length]];

  /* ---------- overview ---------- */
  const m = isl.meta, sc = ["Romance", "Adventure", "Marine life", "Culture"];
  const rt = id === "tahiti" ? null : HM.route("tahiti", id, "fast");
  const fromPapeete = rt ? `<br><b>Door to door from Papeete:</b> ≈ ${HM.hours(rt.mins)} · ≈ ${HM.money(rt.pp)} pp one-way${rt.legs.length > 1 ? " (connects via " + HM.islands[rt.legs[0].to].name + ")" : ""}` : "";
  const fact = (k, v, wide) => `<div class="fact ${wide ? "wide" : ""}"><dt>${k}</dt><dd>${v}</dd></div>`;
  const list = (cls, title, arr) => `<div class="${cls}"><h5>${title}</h5><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  const overview = `<section class="overview" aria-label="Overview">
    <div class="ov-top">
      <div><p class="short">${esc(isl.short)}</p><div class="unique"><h5>What makes ${esc(isl.name)} different</h5><p>${esc(isl.unique)}</p></div></div>
      <div class="scores"><h5>Honeymoon feel</h5>${sc.map((n, i) => `<div class="score"><span>${n}</span><span class="bar">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= isl.scores[i] ? "on" : ""}"></i>`).join("")}</span></div>`).join("")}
        <div class="score"><span>Budget</span><span><b style="color:#b47a0f;letter-spacing:1px">${"$".repeat(isl.cost)}</b> <small style="color:var(--ink-2)">${HM.COST_HINT[isl.cost]}</small></span></div></div>
    </div>
    <dl class="facts">
      ${fact("Population", esc(m.population))}${fact("Area", esc(m.area))}${fact("Highest point", esc(m.highest))}${fact("Languages", esc(m.languages))}
      ${fact("Time zone", esc(m.timezone))}${fact("Recommended stay", esc(m.nights) + " nights")}${fact("Currency", "CFP franc (XPF); euros and cards accepted at resorts, cash for small shops")}${fact("Landscape", esc(isl.terrain) + " · " + esc(isl.group))}
      ${fact("Best time to go", esc(m.bestTime), true)}${fact("Getting there", esc(m.gettingThere) + fromPapeete, true)}
      ${fact("Getting around", esc(m.gettingAround), true)}${fact("Typical costs", esc(m.dailyBudget), true)}
    </dl>
    <div class="lists">${list("good", "Best for", m.bestFor)}${list("skip", "Maybe skip if", m.skipIf)}${list("know", "Good to know", m.goodToKnow)}</div>
  </section>`;

  const chips = `<span class="chip cost" title="${HM.COST_HINT[isl.cost]}"><b>${"$".repeat(isl.cost)}</b> ${HM.COST_LABELS[isl.cost]}</span><span class="chip vibe">${esc(isl.vibe)}</span><span class="chip pace">${esc(isl.pace)}</span><span class="chip terr">${esc(isl.terrain)}</span>`;
  app.innerHTML = `<section class="ihero"><div class="hero-art">${UI.art(isl, { huts: isl.cost >= 4 })}</div>
    <div class="wrap"><a class="crumb" href="index.html">${UI.icons.back} All islands</a>
      <div class="ihero-row"><div><h1>${esc(isl.name)}</h1><p class="tagline">${esc(isl.tagline)}</p><div class="chips">${chips}</div></div>
      <div><p class="rate-cap">Your take on ${esc(isl.name)}</p>${UI.rate("i:" + id, true)}</div></div></div></section>
    <main class="wrap">${overview}
      <div class="explore-head"><h2>Explore ${esc(isl.name)}</h2>
        <div class="seg big" id="view" role="tablist"><button role="tab" type="button" data-view="acts">Activities <small id="n-acts"></small></button><button role="tab" type="button" data-view="stay">Places to stay <small id="n-stay"></small></button></div></div>
      <div id="panel"></div>
      <nav class="explore-head" style="margin-top:0" aria-label="Other islands"><a class="btn" href="island.html?i=${prev.id}">${UI.icons.back} ${esc(prev.name)}</a><a class="btn" href="itinerary.html">Open itinerary</a><a class="btn" href="island.html?i=${next.id}">${esc(next.name)} →</a></nav>
    </main>`;
  document.getElementById("n-acts").textContent = isl.activities.length;
  document.getElementById("n-stay").textContent = isl.lodging.length;

  /* ---------- panels ---------- */
  const view = { v: location.hash === "#stay" ? "stay" : "acts" };
  const AF = { q: "", tags: new Set(), mode: "any", tier: new Set(), price: "", dur: "", mine: "all", sort: "pop" };
  const SF = { q: "", type: new Set(), tags: new Set(), price: "", mine: "all", sort: "price" };
  const mineSeg = (cur) => `<div class="seg" data-f="mine">${[["all", "All"], ["love", "♥ Loved"], ["liked", "♥ + 👍"], ["new", "Not rated yet"], ["hide", "Hide passed"]].map((o) => `<button type="button" data-v="${o[0]}" aria-pressed="${cur === o[0]}">${o[1]}</button>`).join("")}</div>`;
  const sel = (name, opts, cur) => `<select data-f="${name}" aria-label="${name}">${opts.map((o) => `<option value="${o[0]}" ${o[0] === cur ? "selected" : ""}>${o[1]}</option>`).join("")}</select>`;
  const mineOk = (mode, key) => { const r = S.getRating(key); return mode === "all" || (mode === "love" && r === "love") || (mode === "liked" && (r === "love" || r === "like")) || (mode === "new" && !r) || (mode === "hide" && r !== "dislike"); };

  function shell() {
    document.querySelectorAll("#view button").forEach((b) => b.setAttribute("aria-selected", b.dataset.view === view.v));
    const panel = document.getElementById("panel");
    if (view.v === "acts") {
      const tc = {}; isl.activities.forEach((a) => a.tags.forEach((t) => (tc[t] = (tc[t] || 0) + 1)));
      const tierC = {}; isl.activities.forEach((a) => (tierC[a.tier] = (tierC[a.tier] || 0) + 1));
      panel.innerHTML = `<div class="toolbar">
        <div class="tb-row"><label class="search">${UI.icons.search}<input data-f="q" type="search" placeholder="Search ${esc(isl.name)} activities…" value="${esc(AF.q)}"></label>${mineSeg(AF.mine)}</div>
        <div class="tb-row"><span class="tb-label">Type</span><div class="chips" data-f="tier">${Object.keys(HM.TIERS).map((t) => `<button type="button" class="chip" data-v="${t}" aria-pressed="${AF.tier.has(t)}">${HM.TIERS[t]} <small>${tierC[t] || 0}</small></button>`).join("")}</div></div>
        <div class="tb-row"><span class="tb-label">Tags</span><div class="chips" data-f="tags">${Object.keys(HM.ACT_TAGS).filter((t) => tc[t]).sort((a, b) => tc[b] - tc[a]).map((t) => `<button type="button" class="chip" data-v="${t}" aria-pressed="${AF.tags.has(t)}">${HM.ACT_TAGS[t]} <small>${tc[t]}</small></button>`).join("")}</div>
          <span class="seg" data-f="mode"><button type="button" data-v="any" aria-pressed="${AF.mode === "any"}">Any</button><button type="button" data-v="all" aria-pressed="${AF.mode === "all"}">All</button></span></div>
        <div class="tb-row"><span class="tb-label">Price</span>${sel("price", [["", "Any price"], ["0", "Free / included"], ["1", "$ (under $40 pp)"], ["2", "$$ ($40–120)"], ["3", "$$$ ($120–250)"], ["4", "$$$$ ($250+)"]], AF.price)}
          <span class="tb-label">Length</span>${sel("dur", [["", "Any length"], ["s", "Under 2 h"], ["m", "2–4 h"], ["l", "4–7 h"], ["x", "Full day (7 h+)"]], AF.dur)}
          <span class="tb-label">Sort</span>${sel("sort", [["pop", "Most popular"], ["gems", "Hidden gems first"], ["plo", "Price: low → high"], ["phi", "Price: high → low"], ["dur", "Shortest first"], ["az", "A → Z"]], AF.sort)}</div></div>
        <p class="count-line" id="count"></p><div class="acts" id="list"></div>`;
    } else {
      const ty = {}, tg = {}; isl.lodging.forEach((s) => { ty[s.type] = (ty[s.type] || 0) + 1; s.tags.forEach((t) => (tg[t] = (tg[t] || 0) + 1)); });
      panel.innerHTML = `<div class="toolbar">
        <div class="tb-row"><label class="search">${UI.icons.search}<input data-f="q" type="search" placeholder="Search places to stay…" value="${esc(SF.q)}"></label>${mineSeg(SF.mine)}</div>
        <div class="tb-row"><span class="tb-label">Type</span><div class="chips" data-f="type">${Object.keys(ty).map((t) => `<button type="button" class="chip" data-v="${esc(t)}" aria-pressed="${SF.type.has(t)}">${esc(t)} <small>${ty[t]}</small></button>`).join("")}</div></div>
        <div class="tb-row"><span class="tb-label">Features</span><div class="chips" data-f="tags">${Object.keys(HM.STAY_TAGS).filter((t) => tg[t]).map((t) => `<button type="button" class="chip" data-v="${t}" aria-pressed="${SF.tags.has(t)}">${HM.STAY_TAGS[t]} <small>${tg[t]}</small></button>`).join("")}</div></div>
        <div class="tb-row"><span class="tb-label">Nightly rate</span>${sel("price", [["", "Any rate"], ["1", "$ (up to $200)"], ["2", "$$ ($200–450)"], ["3", "$$$ ($450–1,000)"], ["4", "$$$$ ($1,000+)"]], SF.price)}
          <span class="tb-label">Sort</span>${sel("sort", [["price", "Price: low → high"], ["phi", "Price: high → low"], ["az", "A → Z"]], SF.sort)}</div></div>
        <p class="count-line" id="count"></p><div class="acts" id="list"></div>`;
    }
    renderList();
  }

  function renderList() {
    const listEl = document.getElementById("list"), cnt = document.getElementById("count");
    if (view.v === "acts") {
      let r = isl.activities.filter((a) => {
        if (AF.q && !(a.name + " " + a.desc + " " + a.tags.map((t) => HM.ACT_TAGS[t]).join(" ")).toLowerCase().includes(AF.q.toLowerCase())) return false;
        if (AF.tags.size) { const t = [...AF.tags]; if (AF.mode === "all" ? !t.every((x) => a.tags.includes(x)) : !t.some((x) => a.tags.includes(x))) return false; }
        if (AF.tier.size && !AF.tier.has(a.tier)) return false;
        if (AF.price !== "" && HM.priceLevel(a.pp) !== +AF.price) return false;
        if (AF.dur) { const h = a.dur; if (AF.dur === "s" && !(h < 2)) return false; if (AF.dur === "m" && !(h >= 2 && h < 4)) return false; if (AF.dur === "l" && !(h >= 4 && h < 7)) return false; if (AF.dur === "x" && !(h >= 7)) return false; }
        return mineOk(AF.mine, "a:" + a.id);
      });
      const tierRank = { H: 0, U: 1, C: 2 }, so = AF.sort;
      r.sort((a, b) => so === "pop" ? b.pop - a.pop || a.pp - b.pp : so === "gems" ? tierRank[a.tier] - tierRank[b.tier] || b.pop - a.pop : so === "plo" ? a.pp - b.pp : so === "phi" ? b.pp - a.pp : so === "dur" ? a.dur - b.dur : a.name.localeCompare(b.name));
      cnt.innerHTML = `Showing <b>${r.length}</b> of ${isl.activities.length} activities`;
      listEl.innerHTML = r.length ? r.map((a) => UI.actCard(a)).join("") : `<div class="empty"><h3>Nothing matches those filters</h3><p>Loosen a filter or two — or check “All” under ratings.</p></div>`;
    } else {
      let r = isl.lodging.filter((s) => {
        if (SF.q && !(s.name + " " + s.desc + " " + s.where + " " + s.type).toLowerCase().includes(SF.q.toLowerCase())) return false;
        if (SF.type.size && !SF.type.has(s.type)) return false;
        if (SF.tags.size && ![...SF.tags].every((t) => s.tags.includes(t))) return false;
        if (SF.price !== "" && HM.stayLevel(s.ppn) !== +SF.price) return false;
        return mineOk(SF.mine, "s:" + s.id);
      });
      r.sort((a, b) => (SF.sort === "price" ? a.ppn - b.ppn : SF.sort === "phi" ? b.ppn - a.ppn : a.name.localeCompare(b.name)));
      cnt.innerHTML = `Showing <b>${r.length}</b> of ${isl.lodging.length} places to stay · rates are per night for two, mid-range room category`;
      listEl.innerHTML = r.length ? r.map((s) => UI.stayCard(s)).join("") : `<div class="empty"><h3>No stays match those filters</h3></div>`;
    }
  }

  /* ---------- events ---------- */
  document.getElementById("view").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; view.v = b.dataset.view; history.replaceState(null, "", view.v === "stay" ? "#stay" : location.pathname + location.search); shell(); });
  const panel = document.getElementById("panel");
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    const grp = b.closest("[data-f]"), F = view.v === "acts" ? AF : SF, k = grp.dataset.f;
    if (F[k] instanceof Set) { const v = b.dataset.v; F[k].has(v) ? F[k].delete(v) : F[k].add(v); b.setAttribute("aria-pressed", F[k].has(v)); }
    else { F[k] = b.dataset.v; grp.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    renderList();
  });
  const onInput = (e) => { const t = e.target, k = t.dataset && t.dataset.f; if (!k) return; const F = view.v === "acts" ? AF : SF; F[k] = t.value; renderList(); };
  panel.addEventListener("input", onInput); panel.addEventListener("change", onInput);
  document.addEventListener("hm:rating", (e) => { if (e.detail.key.startsWith("i:")) return; const F = view.v === "acts" ? AF : SF; if (F.mine !== "all") renderList(); });
  shell();
})();
