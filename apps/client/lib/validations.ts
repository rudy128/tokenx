import { z } from "zod"

// User validation schemas
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must not exceed 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(255, "Password must not exceed 255 characters"),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address").max(255, "Email must not exceed 255 characters"),
  password: z.string().min(1, "Password is required").max(255, "Password must not exceed 255 characters"),
})

// Campaign validation schemas
const baseCampaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters").max(100, "Campaign name must not exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must not exceed 1000 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  participantLimit: z.number().int().positive("Participant limit must be positive").max(10000, "Participant limit too high").nullable(),
  eligibilityCriteria: z.array(z.string().max(255, "Eligibility criteria item too long")).max(10, "Too many eligibility criteria").optional(),
  rewardPool: z.number().positive("Reward pool must be positive").max(1000000, "Reward pool too high"),
  rewardToken: z.string().min(2, "Token symbol too short").max(10, "Token symbol too long"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
})

export const campaignSchema = baseCampaignSchema.refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: "Start date must be before end date",
  path: ["endDate"],
})

export const updateCampaignSchema = baseCampaignSchema.partial().omit({ status: true }).extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
})

// Task validation schemas
export const taskSchema = z.object({
  campaignId: z.string().cuid("Invalid campaign ID"),
  name: z.string().min(3, "Task name must be at least 3 characters").max(100, "Task name must not exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must not exceed 1000 characters"),
  category: z.enum(["SOCIAL_ENGAGEMENT", "CONTENT_CREATION", "COMMUNITY_BUILDING", "REFERRAL", "CUSTOM"]),
  xpReward: z.number().int().positive("XP reward must be positive").max(10000, "XP reward too high"),
  verificationMethod: z.enum(["AI_AUTO", "MANUAL", "HYBRID"]),
  requirements: z.record(z.unknown()).optional(),
})

// Query parameter validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export const campaignQuerySchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
  search: z.string().max(100, "Search term too long").optional(),
}).merge(paginationSchema)

// Error handling utilities
export class ValidationError extends Error {
  constructor(public issues: z.ZodIssue[]) {
    super("Validation failed")
    this.name = "ValidationError"
  }
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(result.error.issues)
  }
  return result.data
}

export function formatValidationErrors(issues: z.ZodIssue[]): string {
  return issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  windowMs: z.number().int().positive().max(3600000), // Max 1 hour
  max: z.number().int().positive().max(1000), // Max 1000 requests
})

// Environment validation
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url("Invalid database URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "Clerk publishable key is required"),
  CLERK_SECRET_KEY: z.string().min(1, "Clerk secret key is required"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type CampaignInput = z.infer<typeof campaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
export type TaskInput = z.infer<typeof taskSchema>
export type CampaignQuery = z.infer<typeof campaignQuerySchema>
export type EnvConfig = z.infer<typeof envSchema>