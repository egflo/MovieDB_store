import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hosts movie images come from (same list as web_app).
    remotePatterns: [
      { hostname: "assets.fanart.tv" },
      { hostname: "m.media-amazon.com" },
      { hostname: "images-na.ssl-images-amazon.com" },
      { hostname: "ia.media-imdb.com" },
    ],
  },
};

export default nextConfig;
