import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { runTwitterVerification } from '@/lib/twitter-verification'
import { mapSubTaskTypeToTaskType, isTwitterVerifiableType } from '@/lib/task-types'

/* ──────────────────────────────────────────
   GET  /api/tasks/daily
────────────────────────────────────────── */
export async function GET(_: NextRequest) {
  try {
    /* 1 Get authenticated user ───────────────── */
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    /* 2 Get user from database, create if not exists ──────────── */
    let dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!dbUser) {
      // Create user if they don't exist
      dbUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || `user-${session.user.id}@example.com`,
          name: session.user.name || 'New User',
          role: 'AMBASSADOR',
          tier: 'BRONZE',
          xp: 0,
          tokenBalance: 0,
          usdtBalance: 0
        }
      })
      console.log('Created new user for daily tasks:', dbUser.id)
    }

    /* 3 Fetch campaigns user has joined ──────────── */
    const joinedCampaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        CampaignParticipation: {
          some: {
            userId: dbUser.id,
            status: "APPROVED"
          }
        }
      },
      include: {
        Task: {
          where: { status: "active" },
          include: {
            TaskSubmission: {
              where: { userId: dbUser.id },
              select: { 
                id: true, 
                status: true,
                submittedAt: true,
                proofUrl: true,
                description: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    console.log(`📊 Found ${joinedCampaigns.length} joined campaigns for user ${dbUser.id}`)

    /* 4 Transform campaign tasks to match UI format ─────────── */
    const allTasks: any[] = []
    const campaignData: any[] = []

    joinedCampaigns.forEach((campaign: any) => {
      const campaignTasks = campaign.Task.map((task: any) => {
        const userSubmission = task.TaskSubmission[0] // Get user's submission if exists
        
        console.log(`🏷️ Task "${task.name}" from campaign "${campaign.name}" - hasSubmission: ${!!userSubmission}`)

        const mappedTask = {
          id: task.id,
          name: task.name,
          description: task.description,
          taskType: task.category || 'GENERAL',
          category: task.category || 'GENERAL',
          xpReward: task.xpReward,
          campaignName: campaign.name,
          campaignId: campaign.id,
          
          // Proper submission status logic
          status: userSubmission ? 
            (userSubmission.status === 'APPROVED' ? 'completed' : 
             userSubmission.status === 'REJECTED' ? 'rejected' : 'pending') : 
            'available',
          
          isSubmitted: !!userSubmission,
          submissionId: userSubmission?.id ?? null,
          submissionStatus: userSubmission?.status ?? null,
          submittedAt: userSubmission?.submittedAt ?? null,
          
          // Enhanced task details
          deadline: campaign.endDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000),
          verificationMethod: task.verificationMethod?.toUpperCase() ?? "MANUAL",
          instructions: task.requirements || task.description || "Complete this task as instructed.",
          frequency: 'campaign',
          evidenceMode: "manual",
          
          // Additional fields for better UX
          xp: task.xpReward,
          rewardOverride: false,
          rewardToken: campaign.rewardToken,
          rewardAmount: null,
          globalCap: null,
          perUserCap: 1,
          uniqueContent: true
        }

        allTasks.push(mappedTask)
        return mappedTask
      })

      // Add campaign data
      campaignData.push({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        rewardPool: campaign.rewardPool,
        rewardToken: campaign.rewardToken,
        totalTasks: campaignTasks.length,
        completedTasks: campaignTasks.filter((t: any) => t.status === 'completed').length,
        availableTasks: campaignTasks.filter((t: any) => t.status === 'available').length,
        submittedTasks: campaignTasks.filter((t: any) => t.status === 'pending').length,
        rejectedTasks: campaignTasks.filter((t: any) => t.status === 'rejected').length,
        tasks: campaignTasks,
        joined: true
      })
    })

    // ✅ IMPROVED: Better task categorization
    const availableTasks = allTasks.filter((t: any) => t.status === 'available')
    const submittedTasks = allTasks.filter((t: any) => t.status === 'pending')
    const approvedTasks = allTasks.filter((t: any) => t.status === 'completed')
    const rejectedTasks = allTasks.filter((t: any) => t.status === 'rejected')

    console.log(`📈 Task breakdown: ${availableTasks.length} available, ${submittedTasks.length} submitted, ${approvedTasks.length} approved, ${rejectedTasks.length} rejected`)

    /* 5 Return campaign data for UI consistency ─────────── */
    const campaigns = campaignData.length > 0 ? campaignData : [{
      id: "no-campaigns",
      name: "No Joined Campaigns",
      description: "Join campaigns to see available tasks",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1_000),
      rewardPool: 0,
      rewardToken: "USDT",
      totalTasks: 0,
      completedTasks: 0,
      availableTasks: 0,
      submittedTasks: 0,
      rejectedTasks: 0,
      tasks: [],
      joined: false
    }]

    /* 6 Enhanced response with debugging info ─────────────────── */
    const response = {
      success: true,
      data: campaigns,
      debug: {
        message: "Campaign tasks fetched successfully",
        userId: dbUser.id,
        campaignCount: joinedCampaigns.length,
        taskCount: allTasks.length,
        breakdown: {
          available: availableTasks.length,
          submitted: submittedTasks.length,
          approved: approvedTasks.length,
          rejected: rejectedTasks.length
        }
      }
    }

    console.log("✅ API Response ready:", response.debug)
    return NextResponse.json(response, { status: 200 })

  } catch (err) {
    console.error("❌ Error fetching daily tasks:", err)
    
    // Enhanced error response
    const errorResponse = {
      success: false,
      error: "Internal server error",
      message: (err as Error).message,
      debug: {
        timestamp: new Date().toISOString(),
        errorType: (err as Error).constructor.name
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/* ──────────────────────────────────────────
   Optional: POST endpoint for task submissions
────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, evidence } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check which table the task exists in
    const newTask = await prisma.newTask.findUnique({
      where: { id: taskId }
    })

    const oldTask = !newTask ? await prisma.task.findUnique({
      where: { id: taskId }
    }) : null

    if (!newTask && !oldTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    let submission: any

    if (newTask) {
      // Check if user already submitted this task (NewTask)
      const existingSubmission = await prisma.newTaskSubmission.findFirst({
        where: {
          taskId,
          userId: dbUser.id
        }
      })

      if (existingSubmission) {
        return NextResponse.json(
          { error: 'You have already submitted this task' },
          { status: 400 }
        )
      }

      // Create submission for NewTask
      submission = await prisma.newTaskSubmission.create({
        data: {
          taskId: taskId,
          userId: dbUser.id,
          status: 'submitted',
          evidence: evidence || {},
          createdAt: new Date()
        }
      })
    } else if (oldTask) {
      // Check if user already submitted this task (Task)
      const existingSubmission = await prisma.taskSubmission.findFirst({
        where: {
          taskId,
          userId: dbUser.id
        }
      })

      if (existingSubmission) {
        return NextResponse.json(
          { error: 'You have already submitted this task' },
          { status: 400 }
        )
      }

      // Get full task details with subtasks for verification
      const taskWithSubtasks = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          taskSubTasks: true
        }
      })

      // Create submission for Task
      submission = await prisma.taskSubmission.create({
        data: {
          taskId: taskId,
          userId: dbUser.id,
          status: 'PENDING',
          submittedAt: new Date()
        }
      })

      console.log(`✅ Task submission created: ${submission.id} for task ${taskId}`)

      // 🔥 TWITTER VERIFICATION: Check if task uses AI auto-verification ONLY
      const twitterUsername = (dbUser as any)?.twitterUsername
      
      console.log('🔍 Checking verification eligibility:')
      console.log('   - Task verification method:', taskWithSubtasks?.verificationMethod)
      console.log('   - Twitter username set:', !!twitterUsername)
      console.log('   - Subtasks count:', taskWithSubtasks?.taskSubTasks?.length || 0)
      
      // ⚠️ CRITICAL: Only run auto-verification for AI_AUTO tasks
      if (taskWithSubtasks?.verificationMethod !== 'AI_AUTO') {
        console.log('   ✋ SKIPPING auto-verification - Task uses', taskWithSubtasks?.verificationMethod || 'MANUAL', 'verification')
        console.log('   → This task will require admin review')
      } else if (twitterUsername) {
        console.log('🤖 ✅ AI-AUTO verification: Checking for Twitter tasks...')

        // For now, we'll verify the first Twitter-verifiable subtask
        // In the future, you might want to track which specific subtask was completed
        const twitterSubtask = taskWithSubtasks.taskSubTasks?.find((st: any) => 
          isTwitterVerifiableType(st.type)
        )

        if (twitterSubtask) {
          console.log('🐦 Found Twitter subtask:', twitterSubtask.type)
          console.log('   Title:', twitterSubtask.title)
          console.log('   Link:', twitterSubtask.link)

          const twitterUrl = twitterSubtask.link

          if (twitterUrl && twitterUsername) {
            const taskType = mapSubTaskTypeToTaskType(twitterSubtask.type)
            console.log('   Mapped to TaskType:', taskType)
            console.log('   User Twitter:', twitterUsername)

            // Run Twitter verification asynchronously
            runTwitterVerification(
              twitterUrl,
              twitterUsername,
              taskType,
              submission.id
            ).catch((error) => {
              console.error('❌ Twitter verification failed:', error)
            })

            console.log('   ⏳ Twitter verification started in background')
          } else {
            console.log('   ⚠️ Missing Twitter URL or username, skipping verification')
          }
        } else {
          console.log('   ℹ️ No Twitter-verifiable subtasks found')
          console.log('   → Submission will remain PENDING for manual review')
        }
      } else {
        console.log('   ⚠️ User has no Twitter username, skipping auto-verification')
        console.log('   → Submission will remain PENDING for manual review')
      }
    }

    console.log(`✅ Task submission created: ${submission.id} for task ${taskId}`)

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission.id,
        status: submission.status,
        message: "Task submitted successfully"
      }
    })

  } catch (err) {
    console.error("❌ Error creating task submission:", err)
    return NextResponse.json(
      { error: "Failed to submit task", message: (err as Error).message },
      { status: 500 }
    )
  }
}