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
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: `user_${Date.now()}_${user.id}`,
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || 'unknown@example.com',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          role: 'AMBASSADOR'
        }
      })
    }

    const { twitterHandle, postUrl } = await request.json()

    // Simple validation
    if (!twitterHandle || !postUrl) {
      return NextResponse.json(
        { error: 'Twitter handle and post URL are required' },
        { status: 400 }
      )
    }

    // Check if user already submitted this task
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

    // Get task details for verification
    const task = await prisma.newTask.findUnique({
      where: { id: taskId }
    })

    // Save submission to database
    const submission = await prisma.newTaskSubmission.create({
      data: {
        taskId,
        userId: dbUser.id,
        status: 'submitted',
        evidence: {
          twitterHandle,
          postUrl
        }
      }
    })

    // Start Twitter verification in background (non-blocking)
    if (task) {
      console.log(`📝 Starting verification for task: ${task.name}, submission ID: ${submission.id}`)
      // Determine task type from task name (you can improve this logic)
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
        status: 'submitted'
      }
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ data: null })
    }

    const submission = await prisma.newTaskSubmission.findFirst({
      where: {
        taskId,
        userId: dbUser.id
      }
    })

    return NextResponse.json({
      success: true,
      data: submission ? {
        id: submission.id,
        status: submission.status,
        evidence: submission.evidence,
        submittedAt: submission.createdAt
      } : null
    })

  } catch (error) {
    console.error('❌ Get submission error:', error)
    return NextResponse.json(
      { error: 'Failed to get submission status' },
      { status: 500 }
    )
  }
}