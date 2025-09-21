/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed 'output: export' to fix routes-manifest.json error on Vercel
  // This allows proper server-side rendering and routing
};

module.exports = nextConfig;


