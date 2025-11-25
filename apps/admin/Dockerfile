FROM node:20

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy root package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all workspace packages and apps
COPY . .

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
