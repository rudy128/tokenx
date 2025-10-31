import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withAuth } from "@/lib/auth-helpers"

interface RewardCalculation {
  userId: string
  campaignId: string
  totalXP: number
  completedTasks: number
  rewardShare: number
  tokenAmount: number
  usdValue: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session.userId

    if (false) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaignId } = body

    // Mock reward calculation logic - replace with actual implementation
    const rewardCalculations = await calculateCampaignRewards(campaignId)

    return NextResponse.json({
      success: true,
      calculations: rewardCalculations,
      totalDistributed: rewardCalculations.reduce((sum, calc) => sum + calc.tokenAmount, 0),
    })
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

async function calculateCampaignRewards(campaignId: string): Promise<RewardCalculation[]> {
  // Mock campaign data - replace with actual database queries
  const campaignData = {
    id: campaignId,
    rewardPool: 10000,
    rewardToken: "USDT",
    participants: [
      { userId: "user1", totalXP: 450, completedTasks: 8 },
      { userId: "user2", totalXP: 380, completedTasks: 7 },
      { userId: "user3", totalXP: 320, completedTasks: 6 },
      { userId: "user4", totalXP: 280, completedTasks: 5 },
      { userId: "user5", totalXP: 220, completedTasks: 4 },
    ],
  }

  const totalXP = campaignData.participants.reduce((sum, p) => sum + p.totalXP, 0)
  const totalTasks = campaignData.participants.reduce((sum, p) => sum + p.completedTasks, 0)

  // Calculate rewards based on XP contribution (70%) and task completion (30%)
  const calculations: RewardCalculation[] = campaignData.participants.map((participant) => {
    const xpShare = participant.totalXP / totalXP
    const taskShare = participant.completedTasks / totalTasks
    const rewardShare = xpShare * 0.7 + taskShare * 0.3

    const tokenAmount = Math.floor(campaignData.rewardPool * rewardShare)
    const usdValue = campaignData.rewardToken === "USDT" ? tokenAmount : tokenAmount * 0.03 // Mock conversion rate

    return {
      userId: participant.userId,
      campaignId,
      totalXP: participant.totalXP,
      completedTasks: participant.completedTasks,
      rewardShare,
      tokenAmount,
      usdValue,
    }
  })

  return calculations
}
