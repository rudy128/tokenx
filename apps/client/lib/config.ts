import { validateEnvironment } from "./security"
// import { envSchema } from "./validations"

// Validate environment on startup (only in production)
if (process.env.NODE_ENV === 'production') {
  validateEnvironment()
}

// Environment configuration
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Application
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,
  DATABASE_POOL: {
    min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
    idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '10000'),
  },
  
  // Authentication (Clerk-first)
  
  // Security
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || (process.env.NODE_ENV === 'production' ? '14' : '12')),
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  // File Upload
  UPLOAD: {
    maxSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '5'),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf').split(','),
  },
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'debug'),
  ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true',
  
  // External Services
  REDIS_URL: process.env.REDIS_URL,
  
  // OAuth Providers
  OAUTH: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    },
  },
  
  // Clerk
  CLERK: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  },
  
  // Email (for notifications)
  EMAIL: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
  
  // AI
  AI: {
    geminiApiKey: process.env.GEMINI_API_KEY,
  },
} as const

// Validate configuration on startup
export function validateConfig(): void {
  try {
    // Use our custom validation instead of envSchema
    const { validateEnvironmentVariables } = require("./env-debug")
    const validation = validateEnvironmentVariables()
    
    if (validation.isValid) {
      console.log('✅ Environment configuration validated successfully')
    } else {
      console.error('❌ Environment configuration validation failed:', validation.errors)
      if (config.IS_PRODUCTION) {
        process.exit(1)
      }
    }
  } catch (error) {
    console.error('❌ Environment configuration validation failed:', error)
    if (config.IS_PRODUCTION) {
      process.exit(1)
    }
  }
}

// Feature flags
export const features = {
  OAUTH_GOOGLE: !!(config.OAUTH.google.clientId && config.OAUTH.google.clientSecret),
  OAUTH_TWITTER: !!(config.OAUTH.twitter.clientId && config.OAUTH.twitter.clientSecret),
  REDIS_SESSIONS: !!config.REDIS_URL,
  EMAIL_NOTIFICATIONS: !!(config.EMAIL.smtp.host && config.EMAIL.smtp.user),
  AI_VERIFICATION: !!config.AI.geminiApiKey,
  CLERK_AUTH: !!(config.CLERK.publishableKey && config.CLERK.secretKey),
} as const

// Database connection configuration
export const getDatabaseConfig = () => ({
  connectionString: config.DATABASE_URL,
  ssl: config.IS_PRODUCTION ? { rejectUnauthorized: false } : false,
  pool: {
    min: config.DATABASE_POOL.min,
    max: config.DATABASE_POOL.max,
    idleTimeoutMillis: config.DATABASE_POOL.idleTimeoutMillis,
  },
})

// CORS configuration
export const getCorsConfig = () => ({
  origin: config.IS_PRODUCTION 
    ? [config.APP_URL] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

// Session configuration
export const getSessionConfig = () => ({
  strategy: 'jwt' as const,
  maxAge: config.IS_PRODUCTION ? 24 * 60 * 60 : 7 * 24 * 60 * 60, // 1 day prod, 7 days dev
  updateAge: config.IS_PRODUCTION ? 60 * 60 : 24 * 60 * 60, // 1 hour prod, 1 day dev
})

export default config