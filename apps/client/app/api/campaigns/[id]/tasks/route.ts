import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (userId, dbUser) => {
    const resolvedParams = await params
    const campaignId = resolvedParams.id

    try {
      // First, verify the campaign exists and user has access
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          CampaignParticipation: {
            where: { userId: userId },
            select: { status: true }
          }
        }
      })

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        )
      }

      // Check if user is a participant (for joined campaigns) or if campaign is public
      const userParticipation = campaign.CampaignParticipation[0]
      const isParticipant = userParticipation?.status === 'APPROVED'
      
      if (!isParticipant && campaign.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: "Access denied. You must join this campaign to view tasks." },
          { status: 403 }
        )
      }

      // Fetch tasks for this campaign
      const tasks = await prisma.task.findMany({
        where: { 
          campaignId: campaignId,
          status: 'active'
        },
        orderBy: { createdAt: 'asc' }
      })

      // If user is a participant, get their submission status for each task
      let tasksWithStatus = tasks
      
      if (isParticipant) {
        const userSubmissions = await prisma.taskSubmission.findMany({
          where: {
            userId: userId,
            Task: {
              campaignId: campaignId
            }
          },
          include: {
            Task: {
              select: { id: true }
            }
          }
        })

        const submissionMap = new Map(
          userSubmissions.map(sub => [sub.Task.id, sub])
        )

        tasksWithStatus = tasks.map(task => {
          const submission = submissionMap.get(task.id)
          return {
            id: task.id,
            name: task.name,
            description: task.description,
            instructions: Array.isArray(task.requirements) ? task.requirements.join('. ') : task.description,
            actionUrl: undefined, // Not available in current schema
            platform: task.category,
            xp: task.xpReward,
            xpReward: task.xpReward,
            taskType: task.category,
            frequency: 'one_time', // Default since not in schema
            evidenceMode: 'manual', // Default
            approvalWorkflow: task.verificationMethod === 'AI_AUTO' ? 'auto' : 'manual',
            status: task.status, // Use the actual task status from database
            submissionStatus: submission?.status,
            submittedAt: submission?.submittedAt?.toISOString(),
            rejectionReason: undefined, // Not available in current schema
            // Add missing required properties
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            campaignId: task.campaignId,
            category: task.category,
            verificationMethod: task.verificationMethod,
            requirements: task.requirements
          }
        })
      } else {
        // For non-participants, just return basic task info
        tasksWithStatus = tasks.map(task => ({
          id: task.id,
          name: task.name,
          description: task.description,
          instructions: Array.isArray(task.requirements) ? task.requirements.join('. ') : task.description,
          actionUrl: undefined,
          platform: task.category,
          xp: task.xpReward,
          xpReward: task.xpReward,
          taskType: task.category,
          frequency: 'one_time',
          evidenceMode: 'manual',
          approvalWorkflow: task.verificationMethod === 'AI_AUTO' ? 'auto' : 'manual',
          status: task.status, // Use the actual task status from database
          // Add missing required properties
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          campaignId: task.campaignId,
          category: task.category,
          verificationMethod: task.verificationMethod,
          requirements: task.requirements
        }))
      }

      return NextResponse.json(tasksWithStatus)

    } catch (error) {
      console.error('Error fetching campaign tasks:', error)
      return NextResponse.json(
        { error: "Failed to fetch campaign tasks" },
        { status: 500 }
      )
    }
  })
}