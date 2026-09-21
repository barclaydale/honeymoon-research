/* Local preview that behaves like the Vercel deployment: static files + /api/state (in-memory store).
   Usage:  node scripts/dev-server.js [port]     then open http://localhost:8000  (trip code: "dev")  */
const http = require("http"), fs = require("fs"), path = require("path");
process.env.LOCAL_MEMORY_STORE = process.env.LOCAL_MEMORY_STORE || "1";
process.env.TRIP_CODE = process.env.TRIP_CODE || "dev";
const handler = require("../api/state.js");
const root = path.join(__dirname, "..");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".md": "text/markdown" };
const port = +process.argv[2] || +process.env.PORT || 8000;
http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/state") return handler(req, res);
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.statusCode = 404; return res.end("Not found"); }
  res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Tiare & Tide dev server: http://localhost:${port}   (sync trip code: ${process.env.TRIP_CODE})`));
