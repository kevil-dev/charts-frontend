import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Wildcard — allows Apple / Spotify / YouTube CDN artwork URLs
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
