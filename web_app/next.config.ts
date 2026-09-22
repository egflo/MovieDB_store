import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hosts movie images come from; see lib/image.ts.
    remotePatterns: [
      { hostname: "assets.fanart.tv" },
      { hostname: "m.media-amazon.com" },
      { hostname: "images-na.ssl-images-amazon.com" },
      { hostname: "ia.media-imdb.com" },
    ],
    // Image URLs are content-addressed and never change, so keep the resized
    // copies for 30 days rather than the default 4 hours.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
