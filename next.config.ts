import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Ensure strict mode is on to catch any side effects
  reactStrictMode: true,
};

export default nextConfig;
