/* Shortlist: everything rated love / like (and pass), grouped by island. */
(function () {
  const HM = window.HM, UI = HM.ui, S = HM.store, esc = HM.esc;
  UI.header("shortlist");
  const app = document.getElementById("app");
  const R = () => S.state.ratings;
  const byIsland = (items) => HM.order.map((id) => [HM.islands[id], items.filter((x) => x.island === id)]).filter((p) => p[1].length);

  const islandTile = (isl) => `<article class="sl-isl"><div class="art">${UI.art(isl, { noPalms: true })}</div><div class="t"><h4><a href="island.html?i=${isl.id}">${esc(isl.name)}</a></h4><p>${esc(isl.tagline)}</p>${UI.rate("i:" + isl.id, false)}</div></article>`;

  function section(level, icon, title) {
    const isl = HM.order.map((id) => HM.islands[id]).filter((i) => R()["i:" + i.id] === level);
    const acts = Object.values(HM.acts).filter((a) => R()["a:" + a.id] === level);
    const stays = Object.values(HM.stays).filter((s) => R()["s:" + s.id] === level);
    if (!isl.length && !acts.length && !stays.length) return "";
    let h = `<section class="sl-group"><h2>${icon} ${title}</h2>`;
    if (isl.length) h += `<h4 style="margin-top:18px;font-size:18px;font-weight:500">Islands</h4><div class="sl-islands">${isl.map(islandTile).join("")}</div>`;
    if (acts.length) h += `<h4 style="margin-top:22px;font-size:18px;font-weight:500">Activities <span class="chip">${acts.length}</span></h4>` + byIsland(acts).map(([i, list]) => `<h5 style="margin:16px 0 10px;font:600 13px var(--body);text-transform:uppercase;letter-spacing:.1em;color:var(--lagoon-d)"><a href="island.html?i=${i.id}">${esc(i.name)}</a></h5><div class="acts" style="margin-bottom:6px">${list.map((a) => UI.actCard(a)).join("")}</div>`).join("");
    if (stays.length) h += `<h4 style="margin-top:22px;font-size:18px;font-weight:500">Places to stay <span class="chip">${stays.length}</span></h4>` + byIsland(stays).map(([i, list]) => `<h5 style="margin:16px 0 10px;font:600 13px var(--body);text-transform:uppercase;letter-spacing:.1em;color:var(--lagoon-d)"><a href="island.html?i=${i.id}#stay">${esc(i.name)}</a></h5><div class="acts" style="margin-bottom:6px">${list.map((s) => UI.stayCard(s)).join("")}</div>`).join("");
    return h + `</section>`;
  }

  function render() {
    const vals = Object.values(R()), n = (v) => vals.filter((x) => x === v).length;
    let html = section("love", UI.icons.heart, "Loved") + section("like", UI.icons.up, "Liked");
    if (!html) html = `<div class="empty"><h3>Nothing on your shortlist yet</h3><p>Open an island and tap the heart or thumbs-up on anything that catches your eye.</p><p style="margin-top:14px"><a class="btn primary" href="index.html">Browse the islands</a></p></div>`;
    if (n("dislike")) html += `<details class="sl-group"><summary style="cursor:pointer;color:var(--ink-2);font-weight:600">${n("dislike")} passed item${n("dislike") > 1 ? "s" : ""} (hidden from your picks)</summary>${section("dislike", UI.icons.down, "Passed").replace(/^<section class="sl-group">/, "<div>").replace(/<\/section>$/, "</div>")}</details>`;
    app.innerHTML = html;
  }
  document.addEventListener("hm:rating", () => setTimeout(render, 180));
  render();
})();
