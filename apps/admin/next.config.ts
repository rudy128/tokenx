import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript and ESLint validation enabled during build
  // eslint: {
  //   ignoreDuringBuilds: true,  // ❌ Removed - Now validates during build
  // },
  // typescript: {
  //   ignoreBuildErrors: true,    // ❌ Removed - Now validates during build
  // },
};

export default nextConfig;
