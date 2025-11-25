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

# Build client app
RUN pnpm run build --filter=client

# Expose port
EXPOSE 3000

# Set working directory to client app
WORKDIR /app/apps/client

# Start the client app directly (without turbo to avoid rebuilding)
CMD ["pnpm", "start"]
