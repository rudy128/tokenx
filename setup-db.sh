#!/bin/bash

echo "🚀 Setting up Ambassador TokenX Database..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker found"
    
    # Check if container already exists
    if docker ps -a --format 'table {{.Names}}' | grep -q ambassador-postgres; then
        echo "📦 PostgreSQL container already exists"
        
        # Start if stopped
        if ! docker ps --format 'table {{.Names}}' | grep -q ambassador-postgres; then
            echo "🔄 Starting existing PostgreSQL container..."
            docker start ambassador-postgres
        else
            echo "✅ PostgreSQL container is already running"
        fi
    else
        echo "📦 Creating new PostgreSQL container..."
        docker run --name ambassador-postgres \
            -e POSTGRES_PASSWORD=password \
            -e POSTGRES_DB=ambassador_tokenx \
            -d -p 5432:5432 postgres:15
        
        echo "⏳ Waiting for PostgreSQL to start..."
        sleep 5
    fi
    
    echo "🔧 Setting up database schema..."
    pnpm db:generate
    pnpm db:push
    
    echo "✅ Database setup complete!"
    echo "🌐 You can now run: pnpm dev"
    
else
    echo "❌ Docker not found. Please install Docker or use a cloud database."
    echo "📖 See DATABASE_SETUP.md for alternative setup methods."
fi