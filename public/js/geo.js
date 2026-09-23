/* Tiare & Tide — approximate real-world coordinates for the map view (js/map.js).
   Loaded only by map.html, not by boot.js's shared list, since no other page needs it.

   Island centers (airport or main town) are accurate to within a few hundred meters. Individual
   activities/stays/restaurants don't carry their own coordinates in the data, so each one is placed
   by matching its name/description/location text against a short list of real named villages, bays,
   points and passes on that island — also real, hand-placed — then nudged with a small deterministic
   jitter so several items at the same named place fan out instead of stacking exactly on top of each
   other. That's good enough to show which part of an island something is on and to make the map look
   right; it is NOT a substitute for the exact address a resort or tour operator gives you when you
   book (same spirit as the rest of the site's price/time estimates). */
(function () {
  const HM = window.HM;

  // [lat, lng], WGS84
  HM.GEO = {
    tahiti: { center: [-17.5537, -149.6111], places: {
      "papeete": [-17.5334, -149.5667], "faa'a": [-17.5537, -149.6111], "punaauia": [-17.6167, -149.6167],
      "taapuna": [-17.6167, -149.6167], "paea": [-17.6903, -149.5761], "papara": [-17.7500, -149.5333],
      "papeari": [-17.7386, -149.3103], "teahupo'o": [-17.8383, -149.2667], "tahiti iti": [-17.7800, -149.3000],
      "arue": [-17.5167, -149.5167], "pirae": [-17.5333, -149.5500], "point venus": [-17.4917, -149.4833],
      "tahara'a": [-17.4917, -149.4833], "mahina": [-17.4917, -149.4833], "papenoo": [-17.5000, -149.4333],
      "aorai": [-17.6167, -149.5000], "vaihiria": [-17.6667, -149.4167], "vaipahi": [-17.7386, -149.3103],
    } },
    moorea: { center: [-17.4933, -149.7833], places: {
      "temae": [-17.4900, -149.7600], "papetoai": [-17.4900, -149.8600], "maharepa": [-17.4967, -149.8083],
      "cook's bay": [-17.4931, -149.8258], "paopao": [-17.4931, -149.8258], "belvedere": [-17.5270, -149.8324],
      "belvédère": [-17.5270, -149.8324], "opunohu": [-17.5064, -149.8394], "rotui": [-17.5175, -149.8306],
      "haapiti": [-17.5561, -149.8794], "hauru": [-17.5561, -149.8794], "tiahura": [-17.4931, -149.9010],
      "afareaitu": [-17.5464, -149.7639], "vaiare": [-17.5122, -149.7639], "three coconuts": [-17.5194, -149.8244],
      "magic mountain": [-17.5411, -149.8194],
    } },
    borabora: { center: [-16.5011, -151.7514], places: {
      "vaitape": [-16.5011, -151.7514], "matira": [-16.5433, -151.7397], "pofai": [-16.5147, -151.7461],
      "povai": [-16.5147, -151.7461], "faanui": [-16.4794, -151.7669], "anau": [-16.4700, -151.7100],
      "tupai": [-16.2333, -151.8333], "pahia": [-16.5011, -151.7461], "motu tapu": [-16.5261, -151.7075],
    } },
    huahine: { center: [-16.7167, -151.0333], places: {
      "fare": [-16.7167, -151.0333], "maeva": [-16.7000, -151.0167], "faie": [-16.7333, -150.9833],
      "parea": [-16.8167, -151.0000], "avea": [-16.8000, -150.9833], "maroe": [-16.7667, -151.0000],
      "matairea": [-16.7167, -151.0167], "fa'a miti": [-16.7333, -150.9833], "huahine iti": [-16.8000, -150.9900],
      "hana iti": [-16.6833, -150.9833],
    } },
    raiatea: { center: [-16.7167, -151.4667], places: {
      "uturoa": [-16.7333, -151.4333], "apooiti": [-16.7167, -151.4667], "opoa": [-16.8333, -151.3667],
      "taputapuatea": [-16.8333, -151.3667], "tevaitoa": [-16.7833, -151.4833], "faaroa": [-16.8000, -151.3833],
      "temehani": [-16.7667, -151.4667], "tapioi": [-16.7333, -151.4333],
    } },
    tahaa: { center: [-16.6167, -151.5000], places: {
      "patio": [-16.5667, -151.4833], "haamene": [-16.6167, -151.5000], "tautau": [-16.6167, -151.5500],
      "tu vahine": [-16.6167, -151.5500], "tapuamu": [-16.6333, -151.5167], "ohiri": [-16.6167, -151.5167],
      "mahana": [-16.5833, -151.5333],
    } },
    maupiti: { center: [-16.4394, -152.2464], places: {
      "vaiea": [-16.4394, -152.2464], "tereia": [-16.4394, -152.2669], "auira": [-16.4500, -152.2333],
      "teurafaatiu": [-16.4333, -152.2500], "hotuparaoa": [-16.4167, -152.2333],
    } },
    rangiroa: { center: [-14.9667, -147.6667], places: {
      "avatoru": [-14.9667, -147.6667], "tiputa": [-14.9833, -147.6167], "blue lagoon": [-15.2167, -147.9667],
      "otepipi": [-14.9333, -147.5500], "reef island": [-14.9333, -147.5500], "sables roses": [-15.2167, -147.9667],
    } },
    fakarava: { center: [-16.0552, -145.6152], places: {
      "rotoava": [-16.0552, -145.6152], "tetamanu": [-16.5167, -145.4667], "tumakohua": [-16.5167, -145.4667],
      "garuae": [-16.0500, -145.6667], "pk9": [-16.0833, -145.6167], "hirifa": [-16.4667, -145.4833],
      "teahatea": [-16.1500, -145.6167],
    } },
    tikehau: { center: [-15.1167, -148.2333], places: {
      "tuherahera": [-15.1167, -148.2333], "tuheiava": [-15.0000, -148.2500],
    } },
    nukuhiva: { center: [-8.9167, -140.1000], places: {
      "taiohae": [-8.9167, -140.1000], "hatiheu": [-8.8167, -140.0667], "anaho": [-8.8000, -140.0500],
      "taipivai": [-8.8833, -140.0500], "toovii": [-8.8667, -140.1500], "hakaui": [-8.9167, -140.1667],
      "aakapa": [-8.8000, -140.1000], "hiva oa": [-9.7833, -139.0167],
    } },
    tetiaroa: { center: [-17.0167, -149.5667], places: {
      "onetahi": [-17.0167, -149.5667], "rimatu'u": [-17.0000, -149.5833], "reiono": [-17.0333, -149.5833],
    } },
  };

  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  // small deterministic offset (in meters) so items sharing a named place fan out instead of stacking
  function jitter(seed, meters) {
    const h = hash(seed), a = (h % 360) * (Math.PI / 180), r = ((h >>> 9) % 1000) / 1000 * meters;
    return [(r * Math.cos(a)) / 111320, (r * Math.sin(a)) / (111320 * Math.cos((17 * Math.PI) / 180))];
  }
  // best-guess [lat, lng]: longest matching named place > compass hint in the text > island center
  HM.geocode = function (islandId, text, seed) {
    const g = HM.GEO[islandId]; if (!g) return null;
    const t = (text || "").toLowerCase();
    let base = null, bestLen = 0;
    Object.keys(g.places).forEach((k) => { if (t.includes(k) && k.length > bestLen) { base = g.places[k]; bestLen = k.length; } });
    if (!base) {
      const dir = /west coast|west side/.test(t) ? [0, -0.02] : /east coast|east side/.test(t) ? [0, 0.02]
        : /north coast|north side/.test(t) ? [0.02, 0] : /south coast|south side/.test(t) ? [-0.02, 0] : null;
      base = dir ? [g.center[0] + dir[0], g.center[1] + dir[1]] : g.center;
    }
    const [dlat, dlng] = jitter(seed, base === g.center ? 550 : 220);
    return [base[0] + dlat, base[1] + dlng];
  };
})();
