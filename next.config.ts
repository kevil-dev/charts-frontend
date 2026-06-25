import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      // Apple Podcasts artwork (e.g. is1-ssl.mzstatic.com, is2-ssl.mzstatic.com)
      { protocol: "https", hostname: "*.mzstatic.com" },
      // Spotify artwork
      { protocol: "https", hostname: "i.scdn.co" },
      // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      // Spotify podcast images (older CDN)
      { protocol: "https", hostname: "*.spotifycdn.com" },
      // Fallback: allow any https image if the above don't cover a new CDN
      // REMOVE this line once you've confirmed all artwork CDNs are listed above:
      // { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
