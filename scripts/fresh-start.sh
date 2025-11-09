#!/bin/bash

echo "🚀 Fresh Start Script"
echo "===================="
echo ""

# Step 1: Kill all processes
echo "1️⃣  Killing all Node processes..."
pkill -f node 2>/dev/null && echo "   ✅ Processes killed" || echo "   ✅ No processes to kill"
sleep 1

# Step 2: Clear caches
echo ""
echo "2️⃣  Clearing caches..."
rm -rf .next 2>/dev/null
rm -rf apps/client/.next 2>/dev/null
rm -rf apps/admin/.next 2>/dev/null
rm -rf .turbo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
echo "   ✅ Caches cleared"

# Step 3: Regenerate Prisma Client
echo ""
echo "3️⃣  Regenerating Prisma Client..."
cd packages/prisma
npx prisma generate > /dev/null 2>&1
cd ../..
echo "   ✅ Prisma Client generated"

# Step 4: Verify ports are free
echo ""
echo "4️⃣  Verifying ports are free..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3000 still in use, killing..."
    kill -9 $(lsof -ti :3000) 2>/dev/null
fi
if lsof -i :3001 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3001 still in use, killing..."
    kill -9 $(lsof -ti :3001) 2>/dev/null
fi
echo "   ✅ Ports 3000 and 3001 are free"

echo ""
echo "✨ Fresh start complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: pnpm dev"
echo "   2. Wait for both apps to start"
echo "   3. Open http://localhost:3000 (Ambassador)"
echo "   4. Open http://localhost:3001 (Admin)"
echo ""
echo "🔍 If you still have issues:"
echo "   - Check: http://localhost:3000/api/debug/campaigns"
echo "   - Read: TROUBLESHOOTING.md"
echo ""
