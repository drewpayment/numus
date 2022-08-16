/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'mdbcdn.b-cdn.net',
    ],
  },
}

module.exports = nextConfig
