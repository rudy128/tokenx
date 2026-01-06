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
      // First try NewTask model (UUID-based) using the Task model definition from prisma schema
      // Since newTask is not in schema.prisma, we should use the 'task' model which is mapped to 'tasks' table
      task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          TaskSubmissions: {
            select: {
              status: true,
              userId: true
            }
          },
          SubTasks: {
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
          },
          Campaign: {
             select: {
                id: true,
                name: true,
                status: true
             }
          }
        }
      })
      
      if (task) {
        taskSubTasks = task.SubTasks || []
        console.log('✅ Found Task with', taskSubTasks.length, 'subtasks')
      }
    } catch (dbError) {
      console.log('Task query failed:', dbError)
    }

    // If not found, try regular Task model (String-based)
    // The previous block already queried prisma.task, so this redundant block is likely confused legacy code. 
    // Since 'task' is already the result of prisma.task.findUnique, we can just proceed.
    // However, if the first query failed due to UUID mismatch or something, we might have needed fallback, 
    // but the schema says ID is UUID.
    
    // Logic: If 'task' is null from the first block, it didn't find it.
    // The second block tries 'prisma.task.findUnique' AGAIN with the exact same ID.
    // This is redundant and error-prone if the includes are wrong (which they were in the logs).
    // I will comment out this redundant block to avoid confusion and errors.

    /* 
    if (!task) {
      try {
         // ... redundant query ...
      } catch (dbError) {
        console.log('Task query also failed:', dbError)
      }
    }
    */

    // If actual task found, return it
    if (task) {
      // transform task if necessary or just use it. 
      // The frontend likely expects specific field names like 'subTasks' instead of 'SubTasks'.
      // and 'submissions' instead of 'TaskSubmissions'.
      
      const transformedTask = {
        ...task,
        subTasks: (task as any).SubTasks || [],
        submissions: (task as any).TaskSubmissions || []
      }

      return NextResponse.json(transformedTask)
    }

    // Fallback Mock Data as last resort/test
    console.log('Task not found in DB, using mock data for ID:', taskId)
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