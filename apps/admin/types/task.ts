/**
 * Task and SubTask Type Definitions
 * Used across the admin platform for type safety
 */

import type { SubTaskType } from "@prisma/client"

export interface SubTask {
  id: string
  title: string
  description: string
  link: string
  xpReward: number
  order: number
  type?: SubTaskType
  isUploadProof?: boolean
}

export interface CampaignTask {
  id: string
  title: string
  description: string
  type: 'SOCIAL_MEDIA' | 'CONTENT_CREATION' | 'ENGAGEMENT' | 'REFERRAL' | 'OTHER'
  xpReward: number
  isRequired: boolean
  verificationMethod: 'AUTO' | 'MANUAL' | 'LINK_SUBMISSION'
  subTasks: SubTask[]
}

export interface Campaign {
  id: string
  name: string
  description: string
  startDate: Date | string
  endDate: Date | string
  participantLimit?: number | null
  eligibilityCriteria?: string | null
  rewardPool: number
  rewardToken: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  createdById: string
  tasks?: CampaignTask[]
}

export interface Task {
  id: string
  campaignId: string
  name: string
  description: string
  category: 'SOCIAL_ENGAGEMENT' | 'CONTENT_CREATION' | 'COMMUNITY_BUILDING' | 'REFERRAL' | 'CUSTOM'
  xpReward: number
  verificationMethod: 'AI_AUTO' | 'MANUAL' | 'HYBRID'
  requirements?: Record<string, unknown>
  status: 'draft' | 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
  Campaign: {
    id: string
    name: string
    status: string
  }
  taskSubTasks?: SubTask[]
  _count?: {
    TaskSubmission: number
  }
}

export interface TaskFormData {
  campaignId: string
  name: string
  description: string
  category: string
  xpReward: string
  verificationMethod: string
  requirements: string
  status: 'draft' | 'active' | 'archived'
}

export type TaskCategory = 'SOCIAL_ENGAGEMENT' | 'CONTENT_CREATION' | 'COMMUNITY_BUILDING' | 'REFERRAL' | 'CUSTOM'
export type VerificationMethod = 'AI_AUTO' | 'MANUAL' | 'HYBRID'
export type TaskStatus = 'draft' | 'active' | 'archived'
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
