import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  // Ensure correct root when multiple lockfiles exist
  outputFileTracingRoot: join(__dirname, '../..'),
  
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
