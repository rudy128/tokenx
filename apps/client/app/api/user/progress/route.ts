import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-helpers"
import { auth } from "@clerk/nextjs/server"

interface UserProgress {
  totalXP: number
  currentTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  nextTier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  xpToNextTier?: number
  completedTasks: number
  activeCampaigns: number
  achievements: number
  totalEarnings: {
    USDT: number
    NATIVE: number
  }
}

interface TierRequirement {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  minXP: number
  benefits: string[]
}

const TIER_REQUIREMENTS: TierRequirement[] = [
  {
    tier: "BRONZE",
    minXP: 0,
    benefits: ["Basic task access", "Standard rewards", "Community access"],
  },
  {
    tier: "SILVER",
    minXP: 500,
    benefits: ["Priority task access", "10% bonus rewards", "Silver badge", "Early campaign access"],
  },
  {
    tier: "GOLD",
    minXP: 2000,
    benefits: ["Premium task access", "25% bonus rewards", "Gold badge", "Exclusive campaigns", "Direct admin contact"],
  },
  {
    tier: "PLATINUM",
    minXP: 5000,
    benefits: [
      "VIP task access",
      "50% bonus rewards",
      "Platinum badge",
      "Beta feature access",
      "Campaign co-creation",
      "Revenue sharing",
    ],
  },
]

export async function GET() {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userProgress = await calculateUserProgress(userId)

    return NextResponse.json({
      success: true,
      progress: userProgress,
      tierRequirements: TIER_REQUIREMENTS,
    })
  } catch (error) {
    console.error("Error getting user progress:", error);
    return NextResponse.json({ error: "Failed to get user progress" }, { status: 500 });
  }
}

async function calculateUserProgress(userId: string): Promise<UserProgress> {
  // Mock user data - replace with actual database queries
  const mockUserData = {
    totalXP: 1650,
    completedTasks: 18,
    activeCampaigns: 2,
    achievements: 3,
    totalEarnings: {
      USDT: 125.5,
      NATIVE: 2500,
    },
  }

  // Calculate current tier
  const currentTier = calculateTier(mockUserData.totalXP)
  const currentTierIndex = TIER_REQUIREMENTS.findIndex((t) => t.tier === currentTier)
  const nextTierIndex = currentTierIndex + 1

  let nextTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | undefined
  let xpToNextTier: number | undefined

  if (nextTierIndex < TIER_REQUIREMENTS.length) {
    const nextTierData = TIER_REQUIREMENTS[nextTierIndex]
    if (nextTierData) {
      nextTier = nextTierData.tier
      xpToNextTier = nextTierData.minXP - mockUserData.totalXP
    }
  }

  return {
    totalXP: mockUserData.totalXP,
    currentTier,
    nextTier,
    xpToNextTier,
    completedTasks: mockUserData.completedTasks,
    activeCampaigns: mockUserData.activeCampaigns,
    achievements: mockUserData.achievements,
    totalEarnings: mockUserData.totalEarnings,
  }
}

function calculateTier(totalXP: number): "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" {
  if (totalXP >= 5000) return "PLATINUM"
  if (totalXP >= 2000) return "GOLD"
  if (totalXP >= 500) return "SILVER"
  return "BRONZE"
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { xpGained, taskId, campaignId } = body

    // Update user XP and check for tier progression
    const updatedProgress = await updateUserXP(userId, xpGained, taskId, campaignId)

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      tierUp: updatedProgress.tierChanged,
    })
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

async function updateUserXP(
  userId: string,
  xpGained: number,
  taskId: string,
  campaignId: string,
): Promise<UserProgress & { tierChanged?: boolean }> {
  // Mock XP update - replace with actual database operations
  const currentProgress = await calculateUserProgress(userId)
  const oldTier = currentProgress.currentTier
  const newTotalXP = currentProgress.totalXP + xpGained
  const newTier = calculateTier(newTotalXP)

  const updatedProgress = {
    ...currentProgress,
    totalXP: newTotalXP,
    currentTier: newTier,
    completedTasks: currentProgress.completedTasks + 1,
    tierChanged: oldTier !== newTier,
  }

  // If tier changed, trigger achievement and bonus rewards
  if (updatedProgress.tierChanged) {
    await handleTierProgression(userId, oldTier, newTier)
  }

  return updatedProgress
}

async function handleTierProgression(userId: string, oldTier: string, newTier: string): Promise<void> {
  console.log(`User ${userId} progressed from ${oldTier} to ${newTier}`)

  // This would typically:
  // 1. Award tier progression bonus
  // 2. Unlock new achievements
  // 3. Send congratulations notification
  // 4. Update user permissions
  // 5. Apply tier-specific benefits
}
