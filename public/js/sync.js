/* Tiare & Tide — keeps ratings + itinerary in sync across devices via /api/state (Next.js route + Postgres).
   * The browser keeps working offline / when opened from disk: localStorage is always the local cache.
   * Everyone who enters the same trip code shares one itinerary. Changes are merged item-by-item (js/merge.js). */
(function () {
  const HM = window.HM, S = HM.store, M = window.TTMerge;
  const Y = (HM.sync = { status: "local", message: "", last: 0 });
  const CODE_KEY = "tiare-tide.code";
  const API = "/api/state";
  const online = /^https?:$/.test(location.protocol);
  let code = "", pushTimer = null, inflight = false, dirty = false, pollTimer = null, pending = false;

  try { code = localStorage.getItem(CODE_KEY) || ""; } catch (e) {}

  function setStatus(status, message) {
    Y.status = status; Y.message = message || "";
    if (status === "synced") Y.last = Date.now();
    Y.render();
  }
  const changed = (a, b) => M.canon(M.normalize(a)) !== M.canon(M.normalize(b));

  async function call(method, body) {
    const r = await fetch(API, { method, headers: { "x-trip-code": code, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
    let j = null; try { j = await r.json(); } catch (e) {}
    return { status: r.status, json: j };
  }
  function handleFail(res) {
    if (res.status === 409) { dirty = true; return; }   // server was busy merging someone else's save: just try again
    if (res.status === 401) return setStatus("badcode", "That trip code doesn't match.");
    if (res.status === 503) return setStatus("notconfigured", (res.json && res.json.message) || "Sync isn't set up on the server yet.");
    if (res.status === 404) return setStatus("local", "This host has no sync service (saved on this device only).");
    return setStatus("offline", "Couldn't reach the server. Your changes are saved here and will sync when it's back.");
  }
  // adopt a merged state from the server; tell pages to re-render only if something actually changed
  function adopt(remote) {
    const merged = M.merge(S.state, remote);
    const differs = changed(merged, S.state);
    if (differs) { S.adopt(merged); document.dispatchEvent(new CustomEvent("hm:sync")); if (HM.ui) { HM.ui.refreshNav(); HM.ui.refreshPlaced && HM.ui.refreshPlaced(); } }
    return { merged, differs };
  }

  async function pull(force) {
    if (!online || !code || inflight) return;
    if (!force && (Y.status === "badcode" || Y.status === "notconfigured")) return;   // don't hammer a server that said no
    inflight = true; if (Y.status !== "synced") setStatus("syncing");
    try {
      const res = await call("GET");
      if (res.status !== 200) return handleFail(res);
      const { merged } = adopt(res.json.state);
      setStatus("synced");
      if (changed(merged, res.json.state || {})) schedulePush(50);   // we hold newer local work the server doesn't have yet
    } catch (e) { setStatus("offline", "Couldn't reach the server."); }
    finally { inflight = false; if (dirty) schedulePush(50); }
  }
  async function push() {
    if (!online || !code) return;
    pending = false;
    if (inflight) { dirty = true; return; }
    inflight = true; dirty = false; setStatus("syncing");
    try {
      const res = await call("PUT", { state: S.state });
      if (res.status !== 200) return handleFail(res);
      adopt(res.json.state);
      setStatus("synced");
    } catch (e) { setStatus("offline", "Couldn't reach the server."); dirty = true; }
    finally { inflight = false; if (dirty && Y.status !== "offline") schedulePush(dirty && Y.status === "syncing" ? 400 : 50); }
  }
  function schedulePush(ms) { pending = true; clearTimeout(pushTimer); pushTimer = setTimeout(push, ms == null ? 700 : ms); }
  Y.now = () => { pull(true).then(() => { if (Y.status === "synced") schedulePush(0); }); };

  S.onSave = () => { if (online && code) schedulePush(); };

  /* ---------- header pill + code dialog ---------- */
  const LABEL = { local: "Saved on this device", needcode: "Set up sync", syncing: "Syncing…", synced: "Synced", offline: "Offline · will retry", badcode: "Wrong trip code", notconfigured: "Sync not set up" };
  Y.render = function () {
    const el = document.getElementById("sync-pill"); if (!el) return;
    el.dataset.state = Y.status; el.textContent = LABEL[Y.status] || Y.status;
    const t = Y.last ? " · last synced " + new Date(Y.last).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
    el.title = (Y.message || (Y.status === "synced" ? "Your itinerary and ratings are shared with anyone using this trip code." : "Click for sync options")) + t;
    el.hidden = false;
  };
  function dialog() {
    let dlg = document.getElementById("sync-dlg");
    if (!dlg) { dlg = document.createElement("dialog"); dlg.id = "sync-dlg"; document.body.appendChild(dlg); }
    const intro = !online ? "Sync only works on the hosted site (Vercel). This page is running from a file, so everything is saved in this browser only."
      : Y.status === "notconfigured" ? (Y.message || "The server isn't configured yet. See the README: connect a Postgres database and set TRIP_CODE in Vercel, then redeploy.")
      : "Enter the shared trip code (the TRIP_CODE set in Vercel). Use the same code on every device and you'll share one itinerary, live.";
    dlg.innerHTML = `<form method="dialog"><h3>Sync across devices</h3><p class="sub">${HM.esc(intro)}</p>
      ${online ? `<label class="fld">Trip code<input id="sync-code" type="password" autocomplete="off" value="${HM.esc(code)}" placeholder="shared passphrase"></label>` : ""}
      <p class="sub" id="sync-msg">${Y.status === "synced" ? "Status: synced" + (Y.last ? " at " + new Date(Y.last).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "") : ""}</p>
      <div class="dlg-foot">${online && code ? `<button class="btn ghost" value="forget">Forget code on this device</button>` : ""}<button class="btn ghost" value="cancel">Close</button>${online ? `<button class="btn primary" value="save">${code ? "Save &amp; sync now" : "Start syncing"}</button>` : ""}</div></form>`;
    dlg.onclose = () => {
      if (dlg.returnValue === "save") {
        const v = (document.getElementById("sync-code") || {}).value || "";
        if (!v.trim()) return;
        code = v.trim(); try { localStorage.setItem(CODE_KEY, code); } catch (e) {}
        setStatus("syncing"); pull(true).then(() => { if (Y.status === "synced") push(); }); startPolling();
      } else if (dlg.returnValue === "forget") {
        code = ""; try { localStorage.removeItem(CODE_KEY); } catch (e) {} setStatus(online ? "needcode" : "local");
      }
    };
    dlg.returnValue = ""; dlg.showModal();
    const inp = document.getElementById("sync-code"); if (inp) inp.focus();
  }
  document.addEventListener("click", (e) => { if (e.target.closest("#sync-pill")) dialog(); });

  /* ---------- lifecycle ---------- */
  function startPolling() { clearInterval(pollTimer); pollTimer = setInterval(() => { if (!document.hidden) pull(); }, 12000); }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pull(); });
  window.addEventListener("online", () => { pull(); if (dirty) schedulePush(200); });
  // an edit made just before closing/leaving the tab still gets sent
  window.addEventListener("pagehide", () => {
    if (!(online && code && (pending || dirty))) return;
    try { fetch(API, { method: "PUT", keepalive: true, headers: { "x-trip-code": code, "content-type": "application/json" }, body: JSON.stringify({ state: S.state }) }); } catch (e) {}
  });

  if (!online) setStatus("local", "Opened from a file: saved on this device only.");
  else if (!code) setStatus("needcode", "Enter the trip code to share your itinerary across devices.");
  else { setStatus("syncing"); pull(); startPolling(); }
})();
