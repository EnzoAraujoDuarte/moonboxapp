/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure proper build configuration for Vercel deployment
  experimental: {
    esmExternals: false
  },
  // Optimize for production builds
  swcMinify: true,
  // Ensure proper static generation
  trailingSlash: false,
  // Configure image optimization
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;


