FROM node:20

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.0.0

# Copy root package files and workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy only necessary packages and the organization app
COPY packages ./packages
COPY apps/organization ./apps/organization

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN cd packages/prisma && pnpm prisma generate

# Build organization app
RUN pnpm run build --filter=organization

# Expose port
EXPOSE 3002

# Set working directory to organization app
WORKDIR /app/apps/organization

# Start the organization app directly (without turbo to avoid rebuilding)
CMD ["pnpm", "start"]
