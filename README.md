# Ambassador TokenX

A Next.js turbo monorepo for the TokenX Ambassador Program platform.

## Project Structure

This turborepo includes the following apps and packages:

### Apps
- `client`: Next.js app for ambassadors (main user-facing application)
- `admin`: Next.js app for administrators

### Packages
- `@repo/ui`: Shared React component library used by both applications
- `@repo/shared-utils`: Shared utilities including Prisma client, auth helpers, and validation
- `@repo/prisma`: Database schema and migrations
- `@repo/hooks`: Shared React hooks
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configurations

## Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: This project uses pnpm as the package manager
- **Database**: PostgreSQL (for production) or any Prisma-supported database

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Create `.env` files in the required apps. Check `.env.example` files if available.

Required environment variables:
- Database connection string
- Authentication provider credentials (NextAuth.js)
- Any third-party API keys

### 3. Database Setup

```bash
# Push the database schema
pnpm db:push

# Seed the database with initial data
pnpm db:seed

# Or do both in one command
pnpm db:setup
```

### 4. Development

Run all apps and packages in development mode:

```bash
pnpm dev
```

This will start:
- Client app: Usually on `http://localhost:3000`
- Admin app: Usually on `http://localhost:3001`

### 5. Run Specific Apps

To run only the client app:
```bash
pnpm dev --filter=client
```

To run only the admin app:
```bash
pnpm dev --filter=admin
```

## Available Scripts

### Development
- `pnpm dev` - Start all apps in development mode
- `pnpm dev --filter=client` - Start only the client app
- `pnpm dev --filter=admin` - Start only the admin app

### Build
- `pnpm build` - Build all apps and packages
- `pnpm build --filter=client` - Build only the client app

### Database
- `pnpm db:push` - Push schema changes to database
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:setup` - Push schema and seed data
- `pnpm db:migrate` - Run database migrations
- `pnpm db:reset` - Reset database (caution: destroys data)

### Code Quality
- `pnpm lint` - Run ESLint on all packages
- `pnpm check-types` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier

## Project Features

- **Ambassador Program Management**: Complete platform for managing token ambassadors
- **Task Management**: Create and track various ambassador tasks
- **Reward System**: XP and token-based reward distribution
- **User Authentication**: Secure auth with role-based access control
- **Admin Dashboard**: Administrative interface for program management
- **Responsive Design**: Mobile-first responsive UI components

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API routes
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

## Contributing

1. Install dependencies: `pnpm install`
2. Set up your development environment
3. Create a feature branch
4. Make your changes
5. Run tests and linting: `pnpm lint && pnpm check-types`
6. Submit a pull request

## Deployment

### Build for Production
```bash
pnpm build
```

### Environment Variables
Ensure all required environment variables are set in your production environment:
- Database connection strings
- Authentication provider secrets
- Any API keys and external service credentials

## Troubleshooting

### Database Issues
- Ensure your database is running and accessible
- Check your `DATABASE_URL` environment variable
- Try running `pnpm db:push` to sync schema changes

### Build Issues
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Turborepo cache: `pnpm turbo clean`
- Ensure all environment variables are properly set

### Development Issues
- Check that all required environment variables are set
- Ensure database is properly seeded
- Verify authentication configuration