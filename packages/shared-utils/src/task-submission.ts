import { z } from "zod"

export const taskSubmissionSchema = z.object({
  twitterHandle: z
    .string()
    .min(1, "Twitter handle is required")
    .regex(/^@?[A-Za-z0-9_]{1,15}$/, "Please enter a valid Twitter handle (e.g., @username)")
    .transform(val => val.startsWith('@') ? val : `@${val}`),
  
  postUrl: z
    .string()
    .min(1, "Post URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => url.includes("twitter.com") || url.includes("x.com"),
      "Please provide a valid Twitter/X post URL"
    ),
})

export type TaskSubmissionFormData = z.infer<typeof taskSubmissionSchema>

// Submission states for managing task lifecycle
export type SubmissionStatus = 'not_started' | 'submitted' | 'approved' | 'rejected'

export interface TaskSubmission {
  id: string
  taskId: string
  status: SubmissionStatus
  data: TaskSubmissionFormData
  submittedAt: Date
  reviewedAt?: Date
}