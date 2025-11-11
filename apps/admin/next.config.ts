import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure correct root when multiple lockfiles exist
  outputFileTracingRoot: process.cwd(),
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // TypeScript and ESLint validation enabled during build
  // eslint: {
  //   ignoreDuringBuilds: true,  // ❌ Removed - Now validates during build
  // },
  // typescript: {
  //   ignoreBuildErrors: true,    // ❌ Removed - Now validates during build
  // },
};

export default nextConfig;
