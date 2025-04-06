import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
    
  },
  typescript: {
    ignoreBuildErrors: true, // Ignores TypeScript errors during build (if needed)
  },
};

export default nextConfig;
