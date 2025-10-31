import { config } from './config'

export interface LogEntry {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata?: Record<string, any>
  requestId?: string
  userId?: string
}

class Logger {
  private shouldLog(level: string): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 }
    const currentLevel = levels[config.LOG_LEVEL as keyof typeof levels] || 1
    const messageLevel = levels[level as keyof typeof levels] || 1
    
    return messageLevel >= currentLevel
  }

  private formatLog(entry: LogEntry): string {
    if (config.IS_PRODUCTION) {
      // JSON format for production logging systems
      return JSON.stringify({
        timestamp: entry.timestamp,
        level: entry.level.toUpperCase(),
        message: entry.message,
        ...entry.metadata,
        requestId: entry.requestId,
        userId: entry.userId,
      })
    } else {
      // Human-readable format for development
      const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : ''
      const reqId = entry.requestId ? ` [${entry.requestId}]` : ''
      const userId = entry.userId ? ` [user:${entry.userId}]` : ''
      return `${entry.timestamp} [${entry.level.toUpperCase()}]${reqId}${userId} ${entry.message}${meta}`
    }
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>, requestId?: string, userId?: string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      requestId,
      userId,
    }

    const formattedLog = this.formatLog(entry)

    // Output to appropriate stream
    if (level === 'error') {
      console.error(formattedLog)
    } else {
      console.log(formattedLog)
    }
  }

  debug(message: string, metadata?: Record<string, any>, requestId?: string, userId?: string) {
    this.log('debug', message, metadata, requestId, userId)
  }

  info(message: string, metadata?: Record<string, any>, requestId?: string, userId?: string) {
    this.log('info', message, metadata, requestId, userId)
  }

  warn(message: string, metadata?: Record<string, any>, requestId?: string, userId?: string) {
    this.log('warn', message, metadata, requestId, userId)
  }

  error(message: string, error?: Error | any, metadata?: Record<string, any>, requestId?: string, userId?: string) {
    const errorMetadata = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...metadata
    } : metadata

    this.log('error', message, errorMetadata, requestId, userId)
  }

  // Request logging for API routes
  request(method: string, url: string, statusCode: number, duration: number, requestId?: string, userId?: string) {
    if (!config.ENABLE_REQUEST_LOGGING) return

    this.info('Request completed', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
    }, requestId, userId)
  }
}

export const logger = new Logger()

// Request ID middleware helper
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Middleware to add request logging
export function withRequestLogging<T extends Function>(handler: T): T {
  return (async (req: any, res: any, ...args: any[]) => {
    const requestId = generateRequestId()
    const start = Date.now()
    
    // Add request ID to headers for debugging
    if (res && res.setHeader) {
      res.setHeader('x-request-id', requestId)
    }

    try {
      const result = await handler(req, res, ...args)
      
      // Log successful requests
      if (res && res.status) {
        const duration = Date.now() - start
        logger.request(req.method, req.url, res.status, duration, requestId)
      }
      
      return result
    } catch (error) {
      // Log failed requests
      const duration = Date.now() - start
      logger.error('Request failed', error, {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
      }, requestId)
      
      throw error
    }
  }) as unknown as T
}

export default logger