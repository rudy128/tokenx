import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Rate limiting store (in production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // NextJS requires unsafe-inline/eval
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-src 'none'",
  ].join('; '))

  return response
}

// Rate limiting middleware
export function rateLimitMiddleware(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100 // limit each IP to 100 requests per windowMs
) {
  return (req: NextRequest): NextResponse | null => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const key = `rate_limit:${ip}`
    
    const current = rateLimit.get(key)
    
    if (!current || now > current.resetTime) {
      rateLimit.set(key, { count: 1, resetTime: now + windowMs })
      return null
    }
    
    if (current.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString() } }
      )
    }
    
    current.count++
    return null
  }
}


// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000) // Limit length to prevent memory issues
}

// SQL injection prevention helpers
export function escapeSqlLikeString(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

// CSRF protection for forms
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function verifyCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Password strength validation
export function isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty', 
    'letmein', 'welcome', 'monkey', '1234567890'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Environment variable validation (safer version)
export function validateEnvironment(): void {
  // Only validate DATABASE_URL as critical for all scenarios
  const critical = ['DATABASE_URL']
  const missing = critical.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error(`❌ Missing critical environment variables: ${missing.join(', ')}`)
    
    // Only throw in production to prevent build failures during development
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    } else {
      console.warn('⚠️  Development mode: continuing despite missing environment variables')
    }
  }

  // Log authentication configuration status
  const hasNextAuth = process.env.AUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  const hasClerk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  
  if (!hasNextAuth && !hasClerk) {
    console.warn('⚠️  No authentication provider configured (NextAuth or Clerk)')
  } else if (hasNextAuth && hasClerk) {
    console.warn('⚠️  Both NextAuth and Clerk configured - this may cause conflicts')
  } else {
    console.log(`✅ Authentication configured: ${hasClerk ? 'Clerk' : 'NextAuth'}`)
  }
}

// File upload security
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop()
  return ext ? allowedTypes.includes(ext) : false
}

export function isValidFileSize(size: number, maxSizeBytes: number = 5 * 1024 * 1024): boolean {
  return size <= maxSizeBytes
}

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes