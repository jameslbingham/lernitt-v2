/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disables the modern minifier
  experimental: {
    forceSwcTransforms: false, // Stops the specific binary load
  }
};
export default nextConfig;
