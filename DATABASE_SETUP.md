# Quick Database Setup Guide

## The Problem
The registration API is failing because there's no database connection. The error shows:
```
const existingUser = await prisma.user.findUnique({
```
This fails because PostgreSQL isn't running or the database doesn't exist.

## Quick Fix (Choose One Option)

### Option 1: Docker PostgreSQL (Recommended - 2 minutes)
```bash
# 1. Start PostgreSQL in Docker
docker run --name ambassador-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=ambassador_tokenx \
  -d -p 5432:5432 postgres:15

# 2. Set up the database schema
cd /Users/beingseight/Documents/Github/ambassador-tokenX
pnpm db:push

# 3. Start the development server
pnpm dev
```

### Option 2: Cloud Database (Neon - Free)
1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a database and copy the connection string
3. Update `.env.local`:
   ```bash
   DATABASE_URL="your-neon-connection-string-here"
   ```
4. Run:
   ```bash
   pnpm db:push
   pnpm dev
   ```

### Option 3: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb ambassador_tokenx

# Set up schema
pnpm db:push
pnpm dev
```

## Verify Database Connection

After setup, test the connection:
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy"
  }
}
```

## Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Should return:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "test@example.com", 
    "name": "Test User"
  }
}
```