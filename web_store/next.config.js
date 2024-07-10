/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['assets.fanart.tv','images.fanart.tv','m.media-amazon.com','images-na.ssl-images-amazon.com'],
  },
  headers: async () => {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
}

module.exports = nextConfig
