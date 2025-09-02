import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Ensure static files are properly handled in standalone build
  trailingSlash: false,
  generateEtags: false,
};

export default nextConfig;
