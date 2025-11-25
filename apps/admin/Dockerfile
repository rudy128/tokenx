FROM node:20

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy root package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only necessary packages and the admin app
COPY packages ./packages
COPY apps/admin ./apps/admin

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd packages/prisma && pnpm prisma generate

# Build admin app
RUN pnpm run build --filter=admin

# Expose port
EXPOSE 3001

# Start the admin app
CMD ["pnpm", "turbo", "run", "start", "--filter", "admin"]
