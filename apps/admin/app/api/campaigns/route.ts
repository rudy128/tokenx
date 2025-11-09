import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = session.user as { id: string; role?: string }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    const {
      name,
      description,
      startDate,
      endDate,
      participantLimit,
      eligibilityCriteria,
      rewardPool,
      rewardToken,
      status,
      createdById,
    } = body

    // Validation
    if (!name || !description || !startDate || !endDate || !rewardPool) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    if (rewardPool <= 0) {
      return NextResponse.json(
        { error: "Reward pool must be greater than 0" },
        { status: 400 }
      )
    }

    // Extract tasks from body
    const { tasks, ...campaignData } = body

    // Create campaign with tasks and subtasks
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignData.name,
        description: campaignData.description,
        startDate: new Date(campaignData.startDate),
        endDate: new Date(campaignData.endDate),
        participantLimit: campaignData.participantLimit || null,
        eligibilityCriteria: campaignData.eligibilityCriteria || null,
        rewardPool: parseFloat(campaignData.rewardPool),
        rewardToken: campaignData.rewardToken || "USDT",
        status: campaignData.status || "DRAFT",
        createdById: campaignData.createdById || session.user.id,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create tasks with subtasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      await Promise.all(
        tasks.map(async (task: {
          title: string
          description?: string
          type: string
          xpReward: number
          verificationMethod: string
          subTasks?: Array<{
            title: string
            description?: string
            link?: string
            xpReward?: number
            isUploadProof?: boolean
          }>
        }) => {
          // Map task type to TaskCategory enum
          let category: 'SOCIAL_ENGAGEMENT' | 'CONTENT_CREATION' | 'COMMUNITY_BUILDING' | 'REFERRAL' | 'CUSTOM' = 'CUSTOM'
          
          switch(task.type) {
            case 'SOCIAL_MEDIA':
              category = 'SOCIAL_ENGAGEMENT'
              break
            case 'CONTENT':
              category = 'CONTENT_CREATION'
              break
            case 'COMMUNITY':
              category = 'COMMUNITY_BUILDING'
              break
            case 'REFERRAL':
              category = 'REFERRAL'
              break
            default:
              category = 'CUSTOM'
          }
          
          // Create campaign Task (not NewTask)
          const createdTask = await prisma.task.create({
            data: {
              campaignId: campaign.id,
              name: task.title,
              description: task.description || '',
              category: category,
              xpReward: task.xpReward || 0,
              verificationMethod: task.verificationMethod === 'AUTO' ? 'AI_AUTO' : 'MANUAL',
              status: 'active',
            },
          })

          // Create TaskSubTasks if provided  
          if (task.subTasks && Array.isArray(task.subTasks) && task.subTasks.length > 0) {
            for (let i = 0; i < task.subTasks.length; i++) {
              const subTask = task.subTasks[i]
              // @ts-expect-error - TaskSubTask model exists but TS doesn't recognize it yet
              await prisma.taskSubTask.create({
                data: {
                  title: subTask.title,
                  description: subTask.description || undefined,
                  link: subTask.link?.trim() || undefined,
                  xpReward: subTask.xpReward || 0,
                  order: i,
                  isCompleted: false,
                  isUploadProof: subTask.isUploadProof || false,
                  taskId: createdTask.id,
                },
              })
            }
          }
        })
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        campaign,
        message: "Campaign created successfully" 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            CampaignParticipation: true,
            Task: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      { campaigns },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
