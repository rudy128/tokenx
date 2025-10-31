import { NextResponse } from "next/server"
import { testPrismaConnection, validateEnvironmentVariables, logEnvironmentDebugInfo } from "@/lib/env-debug"

export async function GET() {
  try {
    // Log environment debug info for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      logEnvironmentDebugInfo()
    }

    // Validate environment variables
    const envValidation = validateEnvironmentVariables()
    
    // Test database connection safely
    const dbTest = await testPrismaConnection()
    
    // Basic health check response
    const health = {
      status: dbTest.success && envValidation.isValid ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbTest.success ? "healthy" : "unhealthy",
        environment: envValidation.isValid ? "valid" : "invalid", 
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        },
        uptime: Math.floor(process.uptime()),
      },
      // Include validation details in development
      ...(process.env.NODE_ENV === 'development' && {
        validation: {
          missing: envValidation.missing,
          warnings: envValidation.warnings,
          errors: envValidation.errors
        }
      }),
      // Include database error details if any
      ...(dbTest.error && {
        databaseError: dbTest.error
      })
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error("❌ Health check failed:", error)
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Health check failed",
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 503 })
  }

}
