/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  webpack: (config) => {
    config.optimization.minimize = false;
    return config;
  },
};
export default nextConfig;
