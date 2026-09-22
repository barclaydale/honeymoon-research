import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // The site itself is the static index.html (and friends) in public/ —
  // Next.js only adds the /api/state route on top. Map "/" to it explicitly
  // since Next.js doesn't do that implicitly the way a plain static host does.
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
};

export default nextConfig;
