# ======================================
# CLIENT APPLICATION DOCKERFILE
# ======================================
# Using Ubuntu base image for better compatibility

# Stage 1: Builder
FROM ubuntu:22.04 AS builder
WORKDIR /app

# Install Node.js 20, pnpm, and required dependencies
RUN apt-get update && \
    apt-get install -y curl ca-certificates build-essential python3 make g++ && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy entire repository
COPY . .

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd packages/prisma && pnpm prisma generate

# Navigate to client app and build
WORKDIR /app/apps/client
RUN pnpm build

# ======================================
# Stage 2: Runner (Production)
FROM ubuntu:22.04 AS runner
WORKDIR /app

# Install Node.js 20 and OpenSSL
RUN apt-get update && \
    apt-get install -y curl ca-certificates openssl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next/static ./apps/client/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/public ./apps/client/public

    # Copy Prisma files
    COPY --from=builder /app/packages/prisma/schema.prisma ./packages/prisma/schema.prisma
    COPY --from=builder /app/node_modules/.pnpm/@prisma+client@6.17.1_prisma@6.17.1_typescript@5.9.2__typescript@5.9.2/node_modules/.prisma ./node_modules/.prisma

    # Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/client/server.js"]
