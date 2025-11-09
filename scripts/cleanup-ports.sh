#!/bin/bash

echo "🧹 Cleaning up ports and processes..."

# Kill processes on specific ports
echo "Checking ports 3000, 3001, 5000..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port)
    
    if [ -n "$pids" ]; then
        echo "  Killing processes on port $port: $pids"
        kill -9 $pids 2>/dev/null
        echo "  ✅ Port $port cleared"
    else
        echo "  ✅ Port $port is already free"
    fi
}

# Kill specific ports
kill_port 3000
kill_port 3001
kill_port 5000

# Kill any remaining node processes related to Next.js
echo ""
echo "Killing any remaining Next.js processes..."
pkill -f "node.*next" 2>/dev/null && echo "  ✅ Next.js processes killed" || echo "  ✅ No Next.js processes found"

# Clear Next.js cache
echo ""
echo "Clearing Next.js cache..."
rm -rf .next 2>/dev/null
rm -rf apps/client/.next 2>/dev/null
rm -rf apps/admin/.next 2>/dev/null
rm -rf .turbo 2>/dev/null
echo "  ✅ Cache cleared"

echo ""
echo "✨ Cleanup complete! You can now run 'pnpm dev'"
