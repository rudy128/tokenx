/**
 * Environment Debugging and Validation Utility
 * 
 * This module provides comprehensive debugging tools for environment variables
 * and Prisma configuration to help identify and fix runtime errors.
 */

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Step 1: Detailed Environment Logging
export function logEnvironmentDebugInfo(): void {
  console.log("\n🔍 ENVIRONMENT DEBUG INFO")
  console.log("=" + "=".repeat(50))
  
  // Essential environment variables (without exposing secrets)
  const essentialEnvs = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.slice(0, 20)}...` : 'MISSING',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.slice(0, 20)}...` : 'MISSING',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'MISSING',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
  }

  Object.entries(essentialEnvs).forEach(([key, value]) => {
    console.log(`${key}: ${value}`)
  })
  
  console.log("=" + "=".repeat(50) + "\n")
}

// Step 2: Environment Variable Validation with detailed feedback
export interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
  errors: string[]
}

export function validateEnvironmentVariables(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    missing: [],
    warnings: [],
    errors: []
  }

  // Critical environment variables
  const critical = [
    'DATABASE_URL',
  ]

  // Auth-related variables (either NextAuth or Clerk should be configured)
  const nextAuthVars = ['AUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
  const clerkVars = ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY']

  // Check critical variables
  critical.forEach(envVar => {
    if (!process.env[envVar]) {
      result.missing.push(envVar)
      result.errors.push(`Critical: ${envVar} is required`)
      result.isValid = false
    }
  })

  // Check auth configuration (either NextAuth or Clerk)
  const hasNextAuth = nextAuthVars.every(envVar => process.env[envVar])
  const hasClerk = clerkVars.every(envVar => process.env[envVar])

  if (!hasNextAuth && !hasClerk) {
    result.errors.push('Authentication: Either NextAuth (AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) or Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY) variables must be configured')
    result.isValid = false
  }

  if (hasNextAuth && hasClerk) {
    result.warnings.push('Authentication: Both NextAuth and Clerk are configured. This may cause conflicts.')
  }

  // Optional but recommended variables
  const optional = [
    'REDIS_URL',
    'SMTP_HOST',
    'GEMINI_API_KEY'
  ]

  optional.forEach(envVar => {
    if (!process.env[envVar]) {
      result.warnings.push(`Optional: ${envVar} not set - some features may be disabled`)
    }
  })

  return result
}

// Step 3: Prisma Connection Testing with Try-Catch
export async function testPrismaConnection(): Promise<{
  success: boolean
  error?: string
  details?: any
}> {
  try {
    console.log("🔍 Testing Prisma database connection...")
    
    // Test basic connection
    await prisma.$connect()
    console.log("✅ Prisma connection successful")
    
    // Test a simple query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    console.log("✅ Database query test successful:", testQuery)
    
    return { success: true }
  } catch (error) {
    console.error("❌ Prisma connection failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Step 4: Input Validation Helper for API Routes
export function validateEmailInput(email: unknown): { 
  isValid: boolean
  sanitized?: string
  error?: string 
} {
  console.log("🔍 DEBUG: Email validation input:", { email, type: typeof email })
  
  if (!email) {
    return { isValid: false, error: "Email is required" }
  }
  
  if (typeof email !== "string") {
    return { isValid: false, error: "Email must be a string" }
  }
  
  const trimmed = email.trim()
  if (trimmed === "") {
    return { isValid: false, error: "Email cannot be empty" }
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Invalid email format" }
  }
  
  console.log("✅ Email validation passed:", trimmed)
  return { isValid: true, sanitized: trimmed.toLowerCase() }
}

// Step 5: Enhanced Prisma Query with Logging and Error Handling
export async function safePrismaUserFind(email: string): Promise<{
  user: any | null
  success: boolean
  error?: string
}> {
  try {
    console.log("🔍 DEBUG: Prisma user lookup starting...")
    console.log("🔍 DEBUG: Email parameter:", email)
    console.log("🔍 DEBUG: Prisma client status:", prisma ? 'Connected' : 'Not connected')
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log("✅ Prisma query successful, user found:", !!user)
    return { user, success: true }
    
  } catch (error) {
    console.error("❌ Prisma findUnique error:", error)
    console.error("❌ Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return {
      user: null,
      success: false,
      error: error instanceof Error ? error.message : 'Database query failed'
    }
  }
}

// API Response Helper with Error Logging
export function createErrorResponse(message: string, status: number = 500, details?: any): NextResponse {
  console.error(`❌ API Error (${status}):`, message)
  if (details) {
    console.error("❌ Error details:", details)
  }
  
  return NextResponse.json(
    { 
      message, 
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {})
    }, 
    { status }
  )
}

// Startup Environment Check
export function performStartupChecks(): void {
  console.log("\n🚀 PERFORMING STARTUP ENVIRONMENT CHECKS")
  console.log("=" + "=".repeat(60))
  
  // Log environment info
  logEnvironmentDebugInfo()
  
  // Validate environment variables
  const envValidation = validateEnvironmentVariables()
  
  if (!envValidation.isValid) {
    console.error("❌ Environment validation failed:")
    envValidation.errors.forEach(error => console.error(`   - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${envValidation.errors.join(', ')}`)
    }
  }
  
  if (envValidation.warnings.length > 0) {
    console.warn("⚠️  Environment warnings:")
    envValidation.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  if (envValidation.isValid) {
    console.log("✅ Environment validation passed")
  }
  
  console.log("=" + "=".repeat(60) + "\n")
}