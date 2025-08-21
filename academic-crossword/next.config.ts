/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // allow build even if lint errors
  },
};

module.exports = nextConfig;
