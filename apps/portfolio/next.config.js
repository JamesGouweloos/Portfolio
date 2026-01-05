/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Firebase Hosting
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

