FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
RUN npm install -g pnpm
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN pnpm fetch --prod

FROM base AS builder
RUN npm install -g pnpm
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm install
RUN pnpm run build --filter=organization

FROM base AS runtime
EXPOSE 3001
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/apps/organization/.next/standalone ./
COPY --from=builder /app/apps/organization/.next/static ./.next/static
COPY --from=builder /app/apps/organization/public ./public

USER nextjs
CMD ["node", "server.js"]
