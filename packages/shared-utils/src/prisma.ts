import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? new PrismaClient({
  // Optimized logging for development
  log: process.env.NODE_ENV === "development" 
    ? ["query", "warn", "error"] as const
    : ["error"] as const,
  
  // Remove datasources config - URL should be handled via environment only
  // Connection pool settings are handled via DATABASE_URL parameters
})

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

// Enhanced connection error handling
const handleDisconnect = async () => {
  try {
    await prisma.$disconnect()
    console.log("🔌 Prisma disconnected successfully")
  } catch (error) {
    console.error("❌ Error disconnecting Prisma:", error)
  }
}

// Graceful shutdown handlers
if (typeof process.on === 'function') {
  if (process.env.NODE_ENV === "production") {
    process.on("beforeExit", handleDisconnect)
  }
  
  process.on("SIGINT", async () => {
    await handleDisconnect()
    process.exit(0)
  })
  
  process.on("SIGTERM", async () => {
    await handleDisconnect()
    process.exit(0)
  })
}

// Connection health check helper
export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log("✅ Database connection healthy")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}