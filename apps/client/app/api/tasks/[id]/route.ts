import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual params object
    const resolvedParams = await params
    const taskId = resolvedParams.id

    console.log('📥 Fetching task:', taskId)

    // Try to fetch actual task from database
    let task = null
    let taskSubTasks: any[] = []
    
    try {
      // First try NewTask model (UUID-based)
      task = await prisma.newTask.findUnique({
        where: { id: taskId },
        include: {
          submissions: {
            select: {
              status: true,
              userId: true
            }
          },
          subTasks: {
            orderBy: {
              order: 'asc'
            },
            select: {
              id: true,
              title: true,
              description: true,
              link: true,
              xpReward: true,
              order: true,
              isCompleted: true,
              isUploadProof: true,
              type: true
            }
          }
        }
      })
      
      if (task) {
        taskSubTasks = task.subTasks || []
        console.log('✅ Found NewTask with', taskSubTasks.length, 'subtasks')
      }
    } catch (dbError) {
      console.log('NewTask query failed, trying Task model:', dbError)
    }

    // If not found, try regular Task model (String-based)
    if (!task) {
      try {
        const regularTask = await prisma.task.findUnique({
          where: { id: taskId },
          include: {
            Campaign: {
              select: {
                id: true,
                name: true,
                status: true
              }
            },
            TaskSubmission: {
              select: {
                status: true,
                userId: true
              }
            },
            taskSubTasks: {
              orderBy: {
                order: 'asc'
              },
              select: {
                id: true,
                title: true,
                description: true,
                link: true,
                xpReward: true,
                order: true,
                isCompleted: true,
                isUploadProof: true,
                type: true
              }
            }
          }
        })

        if (regularTask) {
          // Transform regular Task to match NewTask structure
          task = {
            id: regularTask.id,
            name: regularTask.name,
            description: regularTask.description,
            instructions: null,
            xp: regularTask.xpReward,
            frequency: 'one_time',
            status: regularTask.status,
            rewardOverride: false,
            rewardToken: null,
            rewardAmount: null,
            perUserCap: null,
            globalCap: null,
            availableFrom: null,
            availableTo: null,
            submissionCutoff: null,
            evidenceMode: 'manual',
            approvalWorkflow: 'manual',
            uniqueContent: false,
            minAccountAgeDays: null,
            minFollowers: null,
            createdAt: regularTask.createdAt,
            updatedAt: regularTask.updatedAt,
            taskType: regularTask.category,
            submissions: regularTask.TaskSubmission,
            subTasks: regularTask.taskSubTasks
          } as any
          
          taskSubTasks = regularTask.taskSubTasks || []
          console.log('✅ Found Task with', taskSubTasks.length, 'subtasks')
        }
      } catch (dbError) {
        console.log('Task query also failed:', dbError)
      }
    }

    // If actual task found, return it
    if (task) {
      const transformedTask = {
        id: task.id,
        name: task.name,
        description: task.description,
        banner: (task as any).banner ?? undefined,
        platform: (task as any).platform ?? undefined,
        platformLogo: (task as any).platformLogo ?? undefined,
        campaign: (task as any).campaign ?? undefined,
        instructions: task.instructions,
        actionUrl: (task as any).actionUrl ?? task.instructions ?? undefined,
        xp: task.xp,
        frequency: task.frequency,
        status: task.status,
        rewardOverride: task.rewardOverride,
        rewardToken: task.rewardToken,
        rewardAmount: task.rewardAmount,
        perUserCap: task.perUserCap,
        globalCap: task.globalCap,
        availableFrom: task.availableFrom,
        availableTo: task.availableTo,
        submissionCutoff: task.submissionCutoff,
        evidenceMode: task.evidenceMode,
        approvalWorkflow: task.approvalWorkflow,
        verificationMode: task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL',
        uniqueContent: task.uniqueContent,
        minAccountAgeDays: task.minAccountAgeDays,
        minFollowers: task.minFollowers,
        createdAt: task.createdAt,
        submissions: task.submissions,
        taskType: (task as any).taskType ?? 'GENERAL',
        steps: (task as any).steps || [],
        referrals: (task as any).referrals || undefined,
        contract: (task as any).contract || undefined,
        contractAddress: (task as any).contractAddress || undefined,
        subTasks: taskSubTasks.map((st: any) => ({
          id: st.id,
          title: st.title,
          description: st.description || null,
          link: st.link || null,
          xpReward: st.xpReward || 0,
          order: st.order || 0,
          isCompleted: st.isCompleted || false,
          type: st.type || 'X_TWEET'
        }))
      }

      console.log('✅ Returning task with', transformedTask.subTasks.length, 'subtasks')
      return NextResponse.json(transformedTask)
    }

    // Fallback to mock data if no actual task found
    const mockTask = {
      id: taskId,
      name: "Daily Social Engagement",
      description: "Engage with our community on social media platforms",
      banner: undefined,
      platform: "Twitter",
      platformLogo: undefined,
      campaign: "Daily Tasks",
      instructions: "Like, retweet, and comment on our latest post",
      actionUrl: "https://x.com/CubaneSpace",
      xp: 50,
      frequency: "daily",
      status: "active",
      rewardOverride: false,
      rewardToken: null,
      rewardAmount: null,
      perUserCap: 1,
      globalCap: null,
      availableFrom: new Date(),
      availableTo: null,
      submissionCutoff: null,
      evidenceMode: "MANUAL",
      approvalWorkflow: "manual",
      verificationMode: "MANUAL",
      uniqueContent: false,
      minAccountAgeDays: null,
      minFollowers: null,
      createdAt: new Date(),
      submissions: [],
      taskType: "SOCIAL_ENGAGEMENT",
      steps: [],
      referrals: undefined,
      contract: undefined,
      contractAddress: undefined
    }

    return NextResponse.json(mockTask)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}