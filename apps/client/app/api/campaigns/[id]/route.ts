import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(request, async (userId, user) => {
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      
      const resolvedParams = await params
      const { id } = resolvedParams

      // Fetch campaign details with participant count
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          CampaignParticipation: {
            where: { status: 'APPROVED' }
          }
        }
      })
      
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
      }

      // Check participation status (for current user)
      const participation = await prisma.campaignParticipation.findFirst({
        where: {
          campaignId: id,
          userId: userId
        }
      })

      // Get user progress if they're a participant
      let userProgress = undefined
      if (participation?.status === 'APPROVED') {
        const userTaskSubmissions = await prisma.taskSubmission.findMany({
          where: {
            userId: userId,
            Task: {
              campaignId: id
            }
          },
          include: {
            Task: {
              select: {
                xpReward: true
              }
            }
          }
        })

        const completedTasks = userTaskSubmissions.filter(
          (submission: any) => submission.status === "APPROVED"
        ).length

        const earnedXP = userTaskSubmissions
          .filter((submission: any) => submission.status === "APPROVED")
          .reduce((total: number, submission: any) => total + (submission.Task.xpReward || 0), 0)

        const totalTasks = await prisma.task.count({
          where: { campaignId: id, status: 'active' }
        })

        userProgress = {
          completedTasks,
          totalTasks,
          earnedXP
        }
      }

      // Compose result object for your frontend
      const result = {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        status: campaign.status,
        participantLimit: campaign.participantLimit,
        currentParticipants: campaign.CampaignParticipation.length,
        rewardPool: campaign.rewardPool,
        rewardToken: campaign.rewardToken,
        eligibilityCriteria: campaign.eligibilityCriteria ? 
          (typeof campaign.eligibilityCriteria === 'string' ? 
            [campaign.eligibilityCriteria] : 
            (Array.isArray(campaign.eligibilityCriteria) ? campaign.eligibilityCriteria : [])) : [],
        createdAt: campaign.createdAt.toISOString(),
        isJoined: participation?.status === 'APPROVED',
        participationStatus: participation?.status || null,
        userProgress
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error("Error fetching campaign:", error)
      return NextResponse.json({ error: "Failed to fetch campaign details" }, { status: 500 })
    }
  });
}
