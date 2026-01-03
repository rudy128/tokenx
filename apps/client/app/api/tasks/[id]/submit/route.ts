import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { runTwitterVerification } from '@/lib/twitter-verification'
import { TaskType } from '@/lib/task-types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${user.id}`,
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || 'unknown@example.com',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          role: 'AMBASSADOR',
        },
      })
    }

    if (dbUser.isBanned) {
      return NextResponse.json({ error: 'Account banned' }, { status: 403 })
    }

    if (dbUser.role === 'AMBASSADOR' && !dbUser.twitterUsername) {
      return NextResponse.json(
        { error: 'Twitter username required. Update your profile before submitting.' },
        { status: 400 }
      )
    }

    const { twitterHandle, postUrl } = await request.json()

    if (!twitterHandle || !postUrl) {
      return NextResponse.json(
        { error: 'Twitter handle and post URL are required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        SubTasks: true,
        Campaign: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const participation = await prisma.campaignParticipation.findFirst({
      where: {
        userId: dbUser.id,
        campaignId: task.campaignId,
        status: 'APPROVED',
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: 'You must join this campaign before submitting tasks.' },
        { status: 403 }
      )
    }

    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        taskId,
        userId: dbUser.id,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this task' },
        { status: 400 }
      )
    }

    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        userId: dbUser.id,
        status: 'PENDING',
        evidence: {
          twitterHandle,
          postUrl,
        },
      },
    })

    if (task) {
      console.log(`📝 Starting verification for task: ${task.name}, submission ID: ${submission.id}`)
      const taskType = task.name.toLowerCase().includes('like') ? 'LIKE' as TaskType :
                      task.name.toLowerCase().includes('retweet') ? 'RT' as TaskType :
                      task.name.toLowerCase().includes('comment') ? 'CMNT' as TaskType :
                      task.name.toLowerCase().includes('quote') ? 'QT' as TaskType :
                      task.name.toLowerCase().includes('thread') ? 'OT' as TaskType :
                      'GENERAL' as TaskType
      
      runTwitterVerification(postUrl, twitterHandle, taskType, submission.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Task submitted successfully',
      data: {
        id: submission.id,
        taskId,
        twitterHandle,
        postUrl,
        status: submission.status,
      },
    })

  } catch (error) {
    console.error('❌ Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit task' },
      { status: 500 }
    )
  }
}

// Check submission status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } })

    if (!dbUser) {
      return NextResponse.json({ data: null })
    }

    const submission = await prisma.taskSubmission.findFirst({
      where: {
        taskId,
        userId: dbUser.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: submission
        ? {
            id: submission.id,
            status: submission.status,
            evidence: submission.evidence,
            submittedAt: submission.createdAt,
          }
        : null,
    })

  } catch (error) {
    console.error('❌ Get submission error:', error)
    return NextResponse.json(
      { error: 'Failed to get submission status' },
      { status: 500 }
    )
  }
}