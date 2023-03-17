/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['assets.fanart.tv','images.fanart.tv','m.media-amazon.com','images-na.ssl-images-amazon.com'],
  }
}

module.exports = nextConfig
