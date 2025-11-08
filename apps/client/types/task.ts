/**
 * Task and SubTask Type Definitions
 * Used across the ambassador platform for type safety
 */

export interface SubTask {
  id: string
  title: string
  description: string | null
  link: string | null
  xpReward: number
  order: number
  isCompleted: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Campaign {
  id: string
  name: string
  slug?: string
  status: string
  description?: string
  startDate?: Date
  endDate?: Date
}

export interface TaskSubmission {
  id: string
  userId: string
  taskId: string
  status: 'in_progress' | 'submitted' | 'approved' | 'rejected'
  evidence?: any
  xpAwarded?: number
  bonusAwarded?: number
  rejectionReason?: string
  createdAt: Date
  submittedAt?: Date | null
  processedAt?: Date | null
}

export interface Task {
  id: string
  name: string
  description: string | null
  instructions?: string | null
  taskType?: string
  xp: number
  status: 'draft' | 'active' | 'archived'
  frequency?: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'recurring'
  rewardOverride?: boolean
  rewardToken?: string | null
  rewardAmount?: number | null
  perUserCap?: number | null
  globalCap?: number | null
  availableFrom?: Date | null
  availableTo?: Date | null
  submissionCutoff?: Date | null
  evidenceMode?: 'auto' | 'manual'
  approvalWorkflow?: 'auto' | 'manual'
  verificationMode?: 'AUTO' | 'MANUAL'
  uniqueContent?: boolean
  minAccountAgeDays?: number | null
  minFollowers?: number | null
  campaignId?: string | null
  campaign?: Campaign
  subTasks: SubTask[]
  submissions?: TaskSubmission[]
  createdAt?: Date
  updatedAt?: Date
}

export interface TaskWithProgress extends Task {
  completedSubtasks: number
  totalSubtasks: number
  completionPercentage: number
  userSubmission?: TaskSubmission
}

export type TaskStatus = 'draft' | 'active' | 'archived'
export type TaskFrequency = 'one_time' | 'daily' | 'weekly' | 'monthly' | 'recurring'
export type SubmissionStatus = 'in_progress' | 'submitted' | 'approved' | 'rejected'
export type EvidenceMode = 'auto' | 'manual'
export type ApprovalWorkflow = 'auto' | 'manual'
