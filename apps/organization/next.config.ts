import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/prisma'],
}

export default config
