import { z } from "zod"

// Campaign join validation schema
export const campaignJoinSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  userId: z.string().min(1, "User ID is required"),
})

// Task completion validation schema
export const taskCompletionSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  userId: z.string().min(1, "User ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  evidence: z.object({
    url: z.string().url("Please provide a valid URL").optional(),
    description: z.string().min(10, "Description must be at least 10 characters").optional(),
    screenshot: z.string().optional(),
  }).optional(),
})

// Campaign membership validation schema
export const campaignMembershipSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  campaignId: z.string().min(1, "Campaign ID is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
})

// Validation helper functions
export const validateCampaignJoin = (data: unknown) => {
  return campaignJoinSchema.safeParse(data)
}

export const validateTaskCompletion = (data: unknown) => {
  return taskCompletionSchema.safeParse(data)
}

export const validateCampaignMembership = (data: unknown) => {
  return campaignMembershipSchema.safeParse(data)
}

// Type exports
export type CampaignJoinData = z.infer<typeof campaignJoinSchema>
export type TaskCompletionData = z.infer<typeof taskCompletionSchema>
export type CampaignMembershipData = z.infer<typeof campaignMembershipSchema>
