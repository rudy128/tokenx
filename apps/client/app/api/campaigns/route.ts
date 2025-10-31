import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"


export async function GET(request: NextRequest) {
  return withAuth(request, async (userId, dbUser) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const joinedParam = searchParams.get("joined")
    const joined = joinedParam === "true" ? true : joinedParam === "false" ? false : null

    let whereCondition: any = {}

    if (status) {
      whereCondition.status = status
    }

    if (joined === true) {
      // Filter campaigns where the current user is an approved participant
      whereCondition.CampaignParticipation = {
        some: {
          userId: userId,
          status: "APPROVED"
        }
      }
    } else if (joined === false) {
      // Filter campaigns where the current user is NOT a participant (any status)
      whereCondition.NOT = {
        CampaignParticipation: {
          some: {
            userId: userId
          }
        }
      }
      whereCondition.status = "ACTIVE"
    } else {
      // If no joined parameter specified, return all active campaigns
      whereCondition.status = "ACTIVE"
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" }
    });

    const enrichedCampaigns = await Promise.all(campaigns.map(async (campaign: any) => {
      // Count approved participants
      const approvedParticipants = await prisma.campaignParticipation.count({
        where: { campaignId: campaign.id, status: 'APPROVED' }
      });

      // Count tasks for campaign
      const taskCount = await prisma.task.count({ where: { campaignId: campaign.id } });
      let userProgress = undefined

      // Check if user has joined this campaign (any status)
      const participation = await prisma.campaignParticipation.findFirst({
        where: { campaignId: campaign.id, userId: userId }
      })
      
      if (participation && participation.status === 'APPROVED') {
          // Get user task submissions for this specific campaign
          const userTaskSubmissions = await prisma.taskSubmission.findMany({
            where: {
              userId: userId,
              Task: {
                campaignId: campaign.id
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
            .reduce((total: number, submission: any) => total + submission.Task.xpReward, 0)

          userProgress = {
            completedTasks,
            totalTasks: taskCount,
            earnedXP
          }
        }

      return {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        participantLimit: campaign.participantLimit,
        currentParticipants: approvedParticipants,
        rewardPool: campaign.rewardPool,
        rewardToken: campaign.rewardToken,
        eligibilityCriteria: campaign.eligibilityCriteria ?
          (typeof campaign.eligibilityCriteria === 'string' ?
            [campaign.eligibilityCriteria] :
            (Array.isArray(campaign.eligibilityCriteria) ? campaign.eligibilityCriteria : [])) : [],
        createdAt: campaign.createdAt.toISOString(),
        isJoined: participation?.status === 'APPROVED',
        userProgress,
        totalTasks: taskCount,
        activeTasks: taskCount // For simplicity, assume all tasks are active
      }
    }))

    return NextResponse.json(enrichedCampaigns)
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, dbUser) => {
    const body = await request.json()
    const { name, description, startDate, endDate, participantLimit, eligibilityCriteria, rewardPool, rewardToken } = body

    if (!name || !description || !startDate || !endDate || !rewardPool) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        id: `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        participantLimit: participantLimit || null,
        eligibilityCriteria: eligibilityCriteria ? JSON.stringify(eligibilityCriteria) : null,
        rewardPool: parseFloat(rewardPool),
        rewardToken: rewardToken || "TKX",
        createdById: userId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      startDate: campaign.startDate.toISOString(),
      endDate: campaign.endDate.toISOString(),
      participantLimit: campaign.participantLimit,
      currentParticipants: 0,
      rewardPool: campaign.rewardPool,
      rewardToken: campaign.rewardToken,
      eligibilityCriteria: campaign.eligibilityCriteria ?
        (typeof campaign.eligibilityCriteria === 'string' ?
          JSON.parse(campaign.eligibilityCriteria) : campaign.eligibilityCriteria) : [],
      createdAt: campaign.createdAt.toISOString()
    }, { status: 201 })
  });
}