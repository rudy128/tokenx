import { config } from './config'

// Simple in-memory cache for development
// In production, this would use Redis or similar
const cache = new Map<string, { data: any; expires: number }>()

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  tags?: string[] // Cache tags for invalidation
}

// Cache implementation
export const cacheManager = {
  // Get from cache
  get: async <T>(key: string): Promise<T | null> => {
    const item = cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() > item.expires) {
      cache.delete(key)
      return null
    }
    
    return item.data as T
  },

  // Set to cache
  set: async <T>(key: string, data: T, options: CacheOptions = {}): Promise<void> => {
    const ttl = options.ttl || 5 * 60 * 1000 // Default 5 minutes
    const expires = Date.now() + ttl
    
    cache.set(key, { data, expires })
  },

  // Delete from cache
  delete: async (key: string): Promise<void> => {
    cache.delete(key)
  },

  // Clear all cache
  clear: async (): Promise<void> => {
    cache.clear()
  },

  // Invalidate by pattern (simple implementation)
  invalidatePattern: async (pattern: string): Promise<void> => {
    const keys = Array.from(cache.keys())
    const regex = new RegExp(pattern)
    
    for (const key of keys) {
      if (regex.test(key)) {
        cache.delete(key)
      }
    }
  }
}

// Cache keys for consistent naming
export const cacheKeys = {
  campaigns: {
    list: (page: number = 1, limit: number = 10) => `campaigns:list:${page}:${limit}`,
    byId: (id: string) => `campaigns:${id}`,
    stats: () => 'campaigns:stats',
  },
  users: {
    byId: (id: string) => `users:${id}`,
    byEmail: (email: string) => `users:email:${email}`,
    stats: () => 'users:stats',
  },
  tasks: {
    byCampaign: (campaignId: string) => `tasks:campaign:${campaignId}`,
    byId: (id: string) => `tasks:${id}`,
  },
  participations: {
    byUser: (userId: string) => `participations:user:${userId}`,
    byCampaign: (campaignId: string) => `participations:campaign:${campaignId}`,
  }
}

// Wrapper function for cached API calls
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheManager.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute function and cache result
  const result = await fn()
  await cacheManager.set(key, result, options)
  
  return result
}

// Clean up expired cache entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, item] of cache.entries()) {
      if (now > item.expires) {
        cache.delete(key)
      }
    }
  }, 5 * 60 * 1000) // Clean up every 5 minutes
}

// Database query optimization helpers
export const queryOptimizations = {
  // Common select fields to reduce data transfer
  userFields: {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
  },
  
  campaignFields: {
    id: true,
    name: true,
    description: true,
    status: true,
    startDate: true,
    endDate: true,
    participantLimit: true,
    rewardPool: true,
    rewardToken: true,
    createdAt: true,
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
      }
    },
    _count: {
      select: {
        tasks: true,
        participations: {
          where: { status: "APPROVED" }
        }
      }
    }
  },

  taskFields: {
    id: true,
    title: true,
    description: true,
    type: true,
    status: true,
    pointValue: true,
    maxCompletions: true,
    createdAt: true,
    campaign: {
      select: {
        id: true,
        name: true,
      }
    },
    _count: {
      select: {
        submissions: true
      }
    }
  }
}

export default cacheManager