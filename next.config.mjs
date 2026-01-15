/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disables the modern minifier
  compiler: {
    styledComponents: true, // Forces a non-SWC transform path
  },
  experimental: {
    forceSwcTransforms: false, // Specifically stops the binary load
  },
  webpack: (config) => {
    config.optimization.minimize = false; // Bypasses SWC at the Webpack level
    return config;
  },
};

export default nextConfig;
