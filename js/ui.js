/* Tiare & Tide — shared UI: header/footer, icons, rating buttons, generated island art, cards, day picker. */
(function () {
  const HM = window.HM, S = HM.store, esc = HM.esc;
  const UI = (HM.ui = {});
  const A = (HM.actions = {});

  /* ---------- icons ---------- */
  const ic = (d, extra) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra || ""}>${d}</svg>`;
  UI.icons = {
    heart: ic('<path d="M12 20.5s-7.5-4.6-9.4-9.3C1.2 7.7 3.2 4.5 6.4 4.5c1.9 0 3.5 1 4.4 2.5l1.2 1.9 1.2-1.9c.9-1.5 2.5-2.5 4.4-2.5 3.2 0 5.2 3.2 3.8 6.7-1.9 4.7-9.4 9.3-9.4 9.3z"/>'),
    up: ic('<path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zM7 11l4-8c1.7 0 2.7 1.3 2.4 3L13 9h5.6a2 2 0 0 1 2 2.4l-1.3 6.6a2 2 0 0 1-2 1.6H7"/>'),
    down: ic('<path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3zM17 13l-4 8c-1.7 0-2.7-1.3-2.4-3L11 15H5.4a2 2 0 0 1-2-2.4l1.3-6.6A2 2 0 0 1 6.7 4.4H17"/>'),
    plane: ic('<path d="M10.5 13.5 3 11.5l1-1.6 7 .6 4-5.5c.6-.8 1.9-1 2.6-.3.6.6.5 1.7-.2 2.4L13 12l.6 7-1.6 1-2-7.5z"/>'),
    boat: ic('<path d="M3 17l2.2 3h13.6L21 17H3zM12 3v10M12 4l6 8h-6M12 6l-5 6h5"/>'),
    ferry: ic('<path d="M3 17l2.2 3h13.6L21 17H3zM5 17l1-6h12l1 6M9 11V7h6v4"/>'),
    clock: ic('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    pin: ic('<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    ext: ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    grip: ic('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>'),
    bed: ic('<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>'),
    back: ic('<path d="M15 5l-7 7 7 7"/>'),
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>'),
    walk: ic('<circle cx="13" cy="4.5" r="1.8"/><path d="M9 21l2.5-6 2.5 2V21M11.5 15l-1-5 3-1.5 2.5 3 2.5.5M10.5 10L8 12.5"/>'),
    cal: ic('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
    print: ic('<path d="M7 9V3h10v6M7 17H4v-6h16v6h-3M7 14h10v7H7z"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    fork: ic('<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.7-3.5 7v3h3.5"/>'),
    sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>')
  };
  UI.modeIcon = (m) => UI.icons[m === "air" ? "plane" : m === "ferry" ? "ferry" : "boat"];

  /* ---------- generated island artwork ---------- */
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rngFor = (seed) => { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  let artN = 0;
  UI.art = function (isl, opts) {
    opts = opts || {};
    const [sky1, sky2, land, lag] = isl.palette, R = rngFor(hash(isl.id)), W = 800, H = 420, hz = 268, n = ++artN;
    const f = (v) => v.toFixed(1);
    const sunX = 480 + R() * 220, sunY = 80 + R() * 50;
    let g = `<defs>
      <linearGradient id="sk${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
      <linearGradient id="lg${n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(lag, "#ffffff", 0.35)}"/><stop offset=".55" stop-color="${lag}"/><stop offset="1" stop-color="${mix(lag, "#0b3b4c", 0.55)}"/></linearGradient>
      <radialGradient id="sn${n}"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
    g += `<rect width="${W}" height="${H}" fill="url(#sk${n})"/>`;
    g += `<circle cx="${f(sunX)}" cy="${f(sunY)}" r="110" fill="url(#sn${n})" opacity=".55"/><circle cx="${f(sunX)}" cy="${f(sunY)}" r="30" fill="#fffaf0" opacity=".9"/>`;
    for (let i = 0; i < 4; i++) { const cx = R() * W, cy = 50 + R() * 90, rx = 50 + R() * 70; g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(rx / 6)}" fill="#fff" opacity="${(0.25 + R() * 0.25).toFixed(2)}"/>`; }
    // land
    const far = mix(land, sky2, 0.55), mid = mix(land, sky2, 0.25), near = land;
    const poly = (pts, fill, op) => `<path d="M${pts.map((p) => f(p[0]) + "," + f(p[1])).join(" L")} Z" fill="${fill}" ${op ? `opacity="${op}"` : ""}/>`;
    const ridge = (x0, x1, base, maxH, jag, step, env) => {
      const pts = [[x0, base]];
      for (let x = x0; x <= x1; x += step) { const t = (x - x0) / (x1 - x0), e = env(t); pts.push([x, base - Math.max(2, e * maxH * (1 - jag + R() * jag * 1.6))]); }
      pts.push([x1, base]); return pts;
    };
    const bell = (t) => Math.pow(Math.sin(Math.PI * t), 0.9);
    const palm = (x, y, s, col) => {
      let p = `<path d="M${x},${y} q${-6 * s},${-38 * s} ${4 * s},${-74 * s}" stroke="${col}" stroke-width="${3.2 * s}" fill="none" stroke-linecap="round"/>`;
      const tx = x + 4 * s, ty = y - 74 * s;
      [[-46, -6], [-34, -26], [-8, -34], [28, -28], [44, -8], [24, 6], [-26, 8]].forEach((v) => { p += `<path d="M${f(tx)},${f(ty)} q${f(v[0] * s * 0.5)},${f(v[1] * s - 6 * s)} ${f(v[0] * s)},${f(v[1] * s + 14 * s)}" stroke="${col}" stroke-width="${2.6 * s}" fill="none" stroke-linecap="round"/>`; });
      return p;
    };
    if (isl.scene === "peaks") {
      g += poly(ridge(90, 720, hz, 175, 0.5, 14, bell), far, 0.8);
      g += poly(ridge(140, 690, hz, 130, 0.42, 12, bell), mid);
      g += poly(ridge(60, 740, hz, 60, 0.35, 16, (t) => 0.6 + 0.4 * Math.sin(t * 9)), near);
    } else if (isl.scene === "spire") {
      const sx = 400 + R() * 60;
      g += poly(ridge(120, 700, hz, 80, 0.4, 14, bell), far, 0.8);
      g += poly([[sx - 95, hz], [sx - 46, hz - 60], [sx - 28, hz - 120], [sx - 14, hz - 196], [sx - 4, hz - 214], [sx + 6, hz - 176], [sx + 30, hz - 118], [sx + 52, hz - 70], [sx + 110, hz]], mid);
      g += poly([[sx - 4, hz - 214], [sx + 6, hz - 176], [sx + 30, hz - 118], [sx + 12, hz - 110], [sx + 4, hz - 150]], mix(mid, "#0b3b4c", 0.25), 0.55);
      g += poly(ridge(80, 720, hz, 46, 0.35, 16, bell), near);
    } else if (isl.scene === "twin") {
      const one = (cx, w, h, col) => { const pts = [[cx - w, hz]]; for (let x = -w; x <= w; x += 12) pts.push([cx + x, hz - h * Math.pow(Math.cos((x / w) * Math.PI / 2), 1.5) * (0.85 + R() * 0.3)]); pts.push([cx + w, hz]); return poly(pts, col); };
      g += one(300, 210, 118, mid) + one(560, 170, 92, near);
      g += poly(ridge(220, 700, hz, 22, 0.3, 14, bell), mix(near, "#0b3b4c", 0.15));
    } else if (isl.scene === "ridges") {
      g += poly(ridge(40, 760, hz, 190, 0.7, 10, (t) => 0.55 + 0.45 * Math.sin(t * 6.5 + 1)), far, 0.85);
      g += poly(ridge(60, 740, hz, 150, 0.65, 9, (t) => 0.5 + 0.5 * Math.sin(t * 8 + 2.4)), mid);
      g += poly(ridge(90, 720, hz, 96, 0.55, 12, bell), near);
      g += `<rect x="0" y="${hz - 70}" width="${W}" height="70" fill="#fff" opacity=".12"/>`;
    } else if (isl.scene === "hill") {
      g += poly(ridge(120, 700, hz, 130, 0.22, 12, bell), far, 0.85);
      g += poly(ridge(90, 720, hz, 92, 0.25, 12, (t) => bell(t) * (0.8 + 0.2 * Math.sin(t * 12))), mid);
      g += poly(ridge(60, 740, hz, 30, 0.3, 18, bell), near);
    } else { // atoll: a long, low ring of motu
      for (let i = 0; i < 4; i++) { const x0 = 30 + i * 200 + R() * 60, w = 90 + R() * 120; g += `<path d="M${f(x0)},${hz} q${f(w / 2)},${-9 - R() * 6} ${f(w)},0 Z" fill="${mix(land, sky2, 0.3)}"/>`; }
      const dark = mix(land, "#0b3b4c", 0.35);
      for (let i = 0; i < 9; i++) g += palm(90 + i * 80 + R() * 40, hz + 2, 0.32 + R() * 0.12, dark);
    }
    // lagoon + reef
    g += `<rect x="0" y="${hz}" width="${W}" height="${H - hz}" fill="url(#lg${n})"/>`;
    g += `<path d="M0,${hz + 34} q100,-8 200,0 t200,0 t200,0 t200,0" stroke="#fff" stroke-width="3" fill="none" opacity=".55"/>`;
    g += `<path d="M0,${hz + 40} q100,-8 200,0 t200,0 t200,0 t200,0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".3"/>`;
    for (let i = 0; i < 16; i++) { const x = R() * W, y = hz + 12 + R() * 140, w = 20 + R() * 60; g += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="1.6" rx=".8" fill="#fff" opacity="${(0.15 + R() * 0.25).toFixed(2)}"/>`; }
    // overwater huts for the luxe islands
    if (isl.cost >= 4 || opts.huts) {
      const hx = 470 + R() * 60; g += `<g opacity=".95"><rect x="${hx - 60}" y="${hz + 118}" width="${190}" height="3" fill="#f3e6cf"/>`;
      for (let i = 0; i < 3; i++) { const x = hx + i * 62; g += `<rect x="${x}" y="${hz + 92}" width="34" height="26" fill="#f7ecd8"/><path d="M${x - 5},${hz + 92} L${x + 17},${hz + 72} L${x + 39},${hz + 92} Z" fill="#b9814f"/><rect x="${x + 3}" y="${hz + 118}" width="2" height="16" fill="#e3d3b4"/><rect x="${x + 28}" y="${hz + 118}" width="2" height="16" fill="#e3d3b4"/>`; }
      g += `</g>`;
    }
    // sand + foreground palms
    g += `<path d="M0,${H} L0,${H - 44} Q220,${H - 78} 430,${H - 40} T800,${H - 52} L800,${H} Z" fill="#f6e7c8"/><path d="M0,${H} L0,${H - 30} Q260,${H - 56} 470,${H - 26} T800,${H - 34} L800,${H} Z" fill="#efd9ae" opacity=".8"/>`;
    if (!opts.noPalms) { const pc = mix(land, "#0b3b4c", 0.5); g += palm(52, H - 34, 1.05, pc) + palm(30, H - 26, 0.75, pc) + palm(752, H - 30, 1.15, pc); }
    return `<svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of ${esc(isl.name)}">${g}</svg>`;
  };

  /* ---------- rating buttons ---------- */
  const RATES = [["love", "Love it", "heart"], ["like", "Like it", "up"], ["dislike", "Not for us", "down"]];
  UI.rate = function (key, labelled) {
    const cur = S.getRating(key);
    return `<div class="rate${labelled ? " labelled" : ""}" data-key="${esc(key)}" role="group" aria-label="Rate">` +
      RATES.map((r) => `<button type="button" class="rbtn ${r[0]}" data-rate="${r[0]}" aria-pressed="${cur === r[0]}" title="${r[1]}">${UI.icons[r[2]]}${labelled ? `<span>${r[0] === "dislike" ? "Pass" : r[1].split(" ")[0]}</span>` : ""}</button>`).join("") + `</div>`;
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rate]"); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const wrap = b.closest(".rate"), key = wrap.dataset.key, val = S.rate(key, b.dataset.rate);
    document.querySelectorAll('.rate[data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]').forEach((w) => w.querySelectorAll(".rbtn").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.rate === val))));
    document.dispatchEvent(new CustomEvent("hm:rating", { detail: { key, val } }));
    UI.refreshNav();
  }, true);

  /* ---------- header / footer / toast ---------- */
  UI.refreshNav = function () {
    const picks = Object.values(S.state.ratings).filter((v) => v === "love" || v === "like").length;
    const p = document.getElementById("nav-picks"), t = document.getElementById("nav-total");
    if (p) { p.textContent = picks; p.hidden = !picks; }
    if (t) { const tot = HM.calcTrip().totals.all; t.textContent = HM.money(tot); t.hidden = !tot; }
  };
  UI.header = function (active) {
    const el = document.getElementById("site-header"); if (!el) return;
    const link = (href, key, label, extra) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ""}>${label}${extra || ""}</a>`;
    el.innerHTML = `<div class="wrap bar"><a class="brand" href="index.html" aria-label="Tiare and Tide home"><svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#0c6e73"/><circle cx="26" cy="14" r="5" fill="#f2b84b"/><path d="M4 26q4-4 8 0t8 0 8 0 8 0v10H4z" fill="#f7ecd8"/><path d="M4 22q4-4 8 0t8 0 8 0 8 0" stroke="#7fd6cf" stroke-width="2" fill="none"/></svg><span>Tiare <em>&amp;</em> Tide</span></a>
      <nav aria-label="Main">${link("index.html", "home", "Islands")}${link("shortlist.html", "shortlist", "Shortlist", ' <span class="pill" id="nav-picks" hidden></span>')}${link("itinerary.html", "itinerary", "Itinerary", ' <span class="pill money" id="nav-total" hidden></span>')}</nav></div>`;
    UI.refreshNav();
  };
  UI.footer = function () {
    const el = document.getElementById("site-footer"); if (!el) return;
    el.innerHTML = `<div class="wrap"><p><strong>Tiare &amp; Tide</strong> · a research notebook for a French Polynesia honeymoon.</p>
      <p class="fine">All prices are rough 2025–26 planning estimates in US dollars (≈100 XPF = $1), per person unless noted. Resorts renovate and rebrand often, and ferry and flight schedules change: confirm with operators before booking. Your ratings and itinerary are saved only in this browser.</p></div>`;
  };
  let toastT;
  UI.toast = function (msg, kind, link) {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.className = "show " + (kind || ""); t.innerHTML = esc(msg) + (link ? ` <a href="${link.href}">${esc(link.text)}</a>` : "");
    clearTimeout(toastT); toastT = setTimeout(() => (t.className = ""), 3800);
  };

  /* ---------- cards ---------- */
  UI.dots = (n, max) => Array.from({ length: max || 5 }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
  UI.tagChips = (tags, dict, limit) => tags.slice(0, limit || 9).map((t) => `<span class="chip tag">${esc(dict[t] || t)}</span>`).join("");

  /* "✓ On Day 3" label so nothing is placed twice, and the in/out-of-season badge */
  UI.placedBadge = function (kind, id) {
    const days = HM.placedDays(kind, id);
    return `<span class="placed" data-pk="${kind}" data-pid="${esc(id)}" ${days.length ? "" : "hidden"}>${UI.icons.check}<span class="pl-t">${esc(HM.placedLabel(days, kind))}</span></span>`;
  };
  UI.refreshPlaced = function () {
    document.querySelectorAll(".placed[data-pk]").forEach((el) => {
      const days = HM.placedDays(el.dataset.pk, el.dataset.pid);
      el.hidden = !days.length; el.querySelector(".pl-t").textContent = HM.placedLabel(days, el.dataset.pk);
      const card = el.closest("[data-id]"); if (card) card.classList.toggle("is-placed", days.length > 0);
    });
  };
  UI.seasonBadge = function (mo) {
    const st = HM.season(mo); if (!st) return "";
    return st === "in" ? `<span class="season in" title="Runs ${esc(HM.moLabel(mo))}. Your trip: ${esc(HM.tripRangeLabel())}">In season</span>`
      : `<span class="season out" title="Best ${esc(HM.moLabel(mo))}. Your trip: ${esc(HM.tripRangeLabel())}">Off-season</span>`;
  };
  const cardCls = (kind, id, extra) => (HM.placedDays(kind, id).length ? " is-placed" : "") + (extra || "");

  UI.actCard = function (a, o) {
    o = o || {};
    const lvl = HM.priceLevel(a.pp), isl = HM.getIsland(a.island), st = HM.season(a.mo);
    return `<article class="act tier-${a.tier}${cardCls("a", a.id, st === "out" ? " offseason" : "")}" data-id="${esc(a.id)}">
      <div class="act-top"><div class="badges"><span class="tier ${a.tier}">${HM.TIERS[a.tier]}</span>${UI.seasonBadge(a.mo)}${UI.placedBadge("a", a.id)}</div>${o.island ? `<a class="where" href="island.html?i=${a.island}">${UI.icons.pin}${esc(isl.name)}</a>` : ""}</div>
      <h3>${esc(a.name)}</h3>
      <p class="desc">${esc(a.desc)}</p>
      <div class="chips">${UI.tagChips(a.tags, HM.ACT_TAGS)}</div>
      <dl class="metrics">
        <div title="How many visitors do this: 5 = nearly everyone"><dt>Popularity</dt><dd><span class="dots">${UI.dots(a.pop)}</span></dd></div>
        <div><dt>Price</dt><dd><span class="price l${lvl}">${HM.priceLabel(lvl)}</span> <small>${a.pp ? "≈ " + HM.money(a.pp) + " pp" : "no cost / included"}</small></dd></div>
        <div><dt>Duration</dt><dd>${UI.icons.clock}${HM.durHours(a.dur)}</dd></div>
        <div><dt>Travel time</dt><dd>${UI.icons.walk}${a.tr ? "≈ " + a.tr + " min each way" : "on site"}</dd></div>
      </dl>
      <div class="act-foot">
        <a class="learn" href="${esc(a.link.url)}" target="_blank" rel="noopener noreferrer">Learn more · ${esc(a.link.label)}${UI.icons.ext}</a>
        <div class="foot-r">${UI.rate("a:" + a.id, true)}<button type="button" class="btn add" data-add="act" data-id="${esc(a.id)}" title="Add to itinerary">${UI.icons.plus}<span>Itinerary</span></button></div>
      </div></article>`;
  };
  UI.stayCard = function (s, o) {
    o = o || {}; const lvl = HM.stayLevel(s.ppn), isl = HM.getIsland(s.island);
    const meals = s.meals ? HM.mealList(s.meals).join(", ") : "";
    return `<article class="act stay${cardCls("s", s.id)}" data-id="${esc(s.id)}">
      <div class="act-top"><div class="badges"><span class="tier stayt">${esc(s.type)}</span>${UI.placedBadge("s", s.id)}</div>${o.island ? `<a class="where" href="island.html?i=${s.island}">${UI.icons.pin}${esc(isl.name)}</a>` : ""}</div>
      <h3>${esc(s.name)}</h3>
      ${s.where ? `<p class="loc">${UI.icons.pin}${esc(s.where)}</p>` : ""}
      <p class="desc">${esc(s.desc)}</p>
      ${s.note ? `<p class="warn-note">${esc(s.note)}</p>` : ""}
      <div class="chips">${UI.tagChips(s.tags, HM.STAY_TAGS)}</div>
      <dl class="metrics">
        <div><dt>Nightly rate</dt><dd><span class="price l${lvl}">${"$".repeat(lvl)}</span> <small>≈ ${HM.money(s.ppn)} for two</small></dd></div>
        <div title="Meals included in the nightly rate. The itinerary assumes you eat these at the hotel."><dt>Meals included</dt><dd>${meals ? `<span class="incl">${UI.icons.fork}${esc(meals)}</span>` : "<small>None</small>"}</dd></div>
      </dl>
      <div class="act-foot">
        <a class="learn" href="${esc(s.link.url)}" target="_blank" rel="noopener noreferrer">Rates &amp; reviews · ${esc(s.link.label)}${UI.icons.ext}</a>
        <div class="foot-r">${UI.rate("s:" + s.id, true)}<button type="button" class="btn add" data-add="stay" data-id="${esc(s.id)}" title="Add to itinerary">${UI.icons.plus}<span>Itinerary</span></button></div>
      </div></article>`;
  };
  UI.mealPills = (str) => HM.MEALS.map((m) => `<i class="mp ${str.includes(m.k) ? "on" : ""}" title="${m.label}${str.includes(m.k) ? " served" : " not served"}">${m.label[0]}</i>`).join("");
  UI.eatCard = function (e, o) {
    o = o || {}; const lvl = HM.eatLevel(e.pp), isl = HM.getIsland(e.island);
    return `<article class="act eat tier-${e.tier}${cardCls("e", e.id)}" data-id="${esc(e.id)}">
      <div class="act-top"><div class="badges"><span class="tier ${e.tier}">${HM.TIERS[e.tier]}</span><span class="chip terr">${esc(e.type)}</span>${UI.placedBadge("e", e.id)}</div>${o.island ? `<a class="where" href="island.html?i=${e.island}">${UI.icons.pin}${esc(isl.name)}</a>` : ""}</div>
      <h3>${esc(e.name)}</h3>
      ${e.where ? `<p class="loc">${UI.icons.pin}${esc(e.where)}</p>` : ""}
      <p class="desc">${esc(e.desc)}</p>
      ${e.note ? `<p class="warn-note">${esc(e.note)}</p>` : ""}
      <div class="chips">${UI.tagChips(e.tags, HM.EAT_TAGS)}</div>
      <dl class="metrics">
        <div><dt>Per person</dt><dd><span class="price l${lvl}">${"$".repeat(lvl)}</span> <small>${e.pp ? "≈ " + HM.money(e.pp) + " / meal" : "included in stay"}</small></dd></div>
        <div><dt>Serves</dt><dd><span class="mps">${UI.mealPills(e.meals)}</span></dd></div>
        <div><dt>Travel time</dt><dd>${UI.icons.walk}${e.tr ? "≈ " + e.tr + " min each way" : "on site"}</dd></div>
      </dl>
      <div class="act-foot">
        <a class="learn" href="${esc(e.link.url)}" target="_blank" rel="noopener noreferrer">Menu &amp; reviews · ${esc(e.link.label)}${UI.icons.ext}</a>
        <div class="foot-r">${UI.rate("r:" + e.id, true)}<button type="button" class="btn add" data-add="eat" data-id="${esc(e.id)}" title="Add to a meal in the itinerary">${UI.icons.plus}<span>Itinerary</span></button></div>
      </div></article>`;
  };

  /* ---------- itinerary actions ---------- */
  const persist = () => { S.save(); UI.refreshNav(); document.dispatchEvent(new CustomEvent("hm:itin")); };
  const dupNote = (kind, id, dayIdx) => { const o = HM.placedDays(kind, id).filter((n) => n !== dayIdx + 1); return o.length ? ` (heads up: it's also on Day ${o.join(", ")})` : ""; };
  A.addAct = function (dayIdx, id, at) {
    const a = HM.getAct(id), d = S.state.itin.days[dayIdx]; if (!a || !d) return { ok: false, msg: "Day not found" };
    if (d.island && d.island !== a.island) return { ok: false, msg: `Day ${dayIdx + 1} is on ${HM.getIsland(d.island).name}. Change the day's island first.` };
    let msg = `Added to Day ${dayIdx + 1}`;
    if (!d.island) { d.island = a.island; msg += ` (now on ${HM.getIsland(a.island).name})`; }
    msg += dupNote("a", id, dayIdx);
    if (HM.season(a.mo) === "out") msg += ` · note: off-season for your dates`;
    d.items.splice(at == null ? d.items.length : at, 0, { uid: S.uid(), t: "a", id }); persist(); return { ok: true, msg };
  };
  A.addCustom = function (dayIdx, c, at) {
    const d = S.state.itin.days[dayIdx]; if (!d) return { ok: false, msg: "Day not found" };
    d.items.splice(at == null ? d.items.length : at, 0, { uid: S.uid(), t: "c", name: c.name, hrs: Number(c.hrs) || 0, cost: Number(c.cost) || 0 }); persist();
    return { ok: true, msg: `Added to Day ${dayIdx + 1}` };
  };
  /* meals: d.meals[k] = {r: restaurantId} | {skip:true} | {out:true} ("eat elsewhere" although the hotel includes it) */
  A.addEat = function (dayIdx, meal, id) {
    const e = HM.getEat(id), d = S.state.itin.days[dayIdx]; if (!e || !d) return { ok: false, msg: "Not found" };
    if (!e.meals.includes(meal)) return { ok: false, msg: `${e.name} doesn't serve ${HM.MEAL_WORD[meal]}.` };
    if (d.island && d.island !== e.island) return { ok: false, msg: `Day ${dayIdx + 1} is on ${HM.getIsland(d.island).name}. ${e.name} is on ${HM.getIsland(e.island).name}.` };
    const st = HM.calcTrip().days[dayIdx].meals[meal];
    if (st.kind === "hotel") return { ok: false, msg: `${HM.MEAL_WORD[meal][0].toUpperCase() + HM.MEAL_WORD[meal].slice(1)} is included at ${st.host.name}. Use “Eat elsewhere” on that meal first.` };
    let msg = `${e.name} → Day ${dayIdx + 1} ${HM.MEAL_WORD[meal]}`;
    if (!d.island) { d.island = e.island; msg += ` (now on ${HM.getIsland(e.island).name})`; }
    msg += dupNote("e", id, dayIdx);
    d.meals = d.meals || {}; d.meals[meal] = { r: id }; persist(); return { ok: true, msg };
  };
  A.addEatAuto = function (dayIdx, id) {   // first sensible open meal that this restaurant serves
    const e = HM.getEat(id), day = HM.calcTrip().days[dayIdx]; if (!e || !day) return { ok: false, msg: "Not found" };
    const order = e.meals.includes("d") ? ["d", "l", "b"] : e.meals.includes("l") ? ["l", "b", "d"] : ["b", "l", "d"];
    const k = order.find((m) => e.meals.includes(m) && ["open", "out", "none"].includes(day.meals[m].kind));
    return k ? A.addEat(dayIdx, k, id) : { ok: false, msg: `No open meal on Day ${dayIdx + 1} that ${e.name} serves.` };
  };
  A.setMeal = function (dayIdx, meal, val) {   // val: null (clear) | {skip:true} | {out:true}
    const d = S.state.itin.days[dayIdx]; if (!d) return; d.meals = d.meals || {};
    if (val) d.meals[meal] = val; else delete d.meals[meal]; persist();
  };
  A.addStay = function (dayIdxs, id) {
    const s = HM.getStay(id); if (!s) return { ok: false, msg: "Stay not found" };
    let n = 0;
    dayIdxs.forEach((i) => { const d = S.state.itin.days[i]; if (d && (!d.island || d.island === s.island)) { d.island = s.island; d.lodging = id; n++; } });
    persist(); return n ? { ok: true, msg: `${s.name} set for ${n} night${n > 1 ? "s" : ""}` } : { ok: false, msg: "No matching days" };
  };
  A.ensureDays = (n) => { const it = S.state.itin; while (it.days.length < n) it.days.push(HM.blankDay()); };

  /* ---------- "which day?" picker ---------- */
  UI.pickDay = function (kind, id) {
    const item = kind === "act" ? HM.getAct(id) : kind === "eat" ? HM.getEat(id) : HM.getStay(id); if (!item) return;
    const trip = HM.calcTrip();
    let dlg = document.getElementById("day-dlg");
    if (!dlg) { dlg = document.createElement("dialog"); dlg.id = "day-dlg"; document.body.appendChild(dlg); }
    const isl = HM.getIsland(item.island);
    if (kind === "eat") {
      const erows = trip.days.map((d, i) => {
        const okIsl = !d.island || d.island === item.island, date = HM.dayDate(i);
        const btns = HM.MEALS.map((m) => {
          const st = d.meals[m.k]; let why = "";
          if (!okIsl) why = "Different island"; else if (!item.meals.includes(m.k)) why = "Not served at " + HM.MEAL_WORD[m.k]; else if (st.kind === "hotel") why = "Included at " + st.host.name; else if (st.kind === "eat") why = "Already planned: " + st.e.name;
          return `<button type="button" class="mealbtn" data-day="${i}" data-meal="${m.k}" ${why ? `disabled title="${esc(why)}"` : `title="Add to ${m.label.toLowerCase()}"`}>${m.label}</button>`;
        }).join("");
        return `<div class="dayrow eatrow ${okIsl ? "" : "off"}"><span><b>Day ${i + 1}</b>${date ? ` <em>${date}</em>` : ""}<br><small>${esc(d.island ? HM.getIsland(d.island).name : "Unassigned")}</small></span><span class="mealbtns">${btns}</span></div>`;
      }).join("");
      dlg.innerHTML = `<form method="dialog"><h3>Which meal?</h3><p class="sub">${esc(item.name)} · ${esc(isl.name)} · ≈ ${HM.money(item.pp * 2)} for two · serves ${esc(HM.mealList(item.meals).join(", "))}</p>
        <div class="dayrows">${erows}</div><div class="dlg-foot"><button class="btn ghost" value="cancel">Close</button></div></form>`;
      dlg.onclose = null; dlg.onclick = (ev) => {
        const b = ev.target.closest(".mealbtn"); if (!b || b.disabled) return;
        const r = A.addEat(+b.dataset.day, b.dataset.meal, id); dlg.close();
        UI.toast(r.msg, r.ok ? "ok" : "err", r.ok ? { href: "itinerary.html", text: "View itinerary →" } : null);
      };
      dlg.returnValue = ""; dlg.showModal(); return;
    }
    dlg.onclick = null;
    const rows = trip.days.map((d, i) => {
      const ok = !d.island || d.island === item.island, date = HM.dayDate(i);
      const meta = (d.island ? HM.getIsland(d.island).name : "Unassigned") + (d.mins ? " · " + HM.hours(d.mins) + " planned" : "");
      return `<label class="dayrow ${ok ? "" : "off"}"><input type="${kind === "act" ? "radio" : "checkbox"}" name="d" value="${i}" ${ok ? "" : "disabled"}><span><b>Day ${i + 1}</b>${date ? ` <em>${date}</em>` : ""}</span><small>${esc(meta)}</small></label>`;
    }).join("");
    dlg.innerHTML = `<form method="dialog"><h3>${kind === "act" ? "Add to which day?" : "Which nights?"}</h3>
      <p class="sub">${esc(item.name)} · ${esc(isl.name)}${kind === "act" ? ` · ${HM.hours(HM.actMins(item))} incl. travel` : ` · ≈ ${HM.money(item.ppn)}/night`}</p>
      <div class="dayrows">${rows}</div>
      <div class="dlg-foot"><button class="btn ghost" value="cancel">Cancel</button><button class="btn primary" id="dlg-ok" value="ok" disabled>${kind === "act" ? "Add to day" : "Set lodging"}</button></div></form>`;
    const ok = dlg.querySelector("#dlg-ok");
    dlg.querySelectorAll("input").forEach((i) => i.addEventListener("change", () => (ok.disabled = !dlg.querySelector("input:checked"))));
    dlg.onclose = () => {
      if (dlg.returnValue !== "ok") return;
      const picked = [...dlg.querySelectorAll("input:checked")].map((i) => +i.value);
      const r = kind === "act" ? A.addAct(picked[0], id) : A.addStay(picked, id);
      UI.toast(r.msg, r.ok ? "ok" : "err", r.ok ? { href: "itinerary.html", text: "View itinerary →" } : null);
    };
    dlg.returnValue = ""; dlg.showModal();
  };
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-add]"); if (b) UI.pickDay(b.dataset.add, b.dataset.id); });
  document.addEventListener("hm:itin", () => UI.refreshPlaced());

  document.addEventListener("DOMContentLoaded", () => { UI.footer(); });
})();
