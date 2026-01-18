/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Disable the failing SWC binary for minification
  swcMinify: false,
  
  // 2. Keep your existing webpack optimizations for older hardware
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
};

export default nextConfig;
