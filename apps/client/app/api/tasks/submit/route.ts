import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { runTwitterVerification } from '@/lib/twitter-verification'
import { mapSubTaskTypeToTaskType, isTwitterVerifiableType } from '@/lib/task-types'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse FormData
    const formData = await req.formData()
    const taskId = formData.get('taskId') as string
    const subTaskId = formData.get('subTaskId') as string | null  // Optional: for subtask submission
    const proofFile = formData.get('proofFile') as File | null

    // 🔍 DEBUG: Log what we received
    console.log('📥 API Route - Received FormData:')
    console.log('   Task ID:', taskId)
    console.log('   Subtask ID:', subTaskId)
    console.log('   User ID:', session.user.id)
    console.log('   Has Proof File:', !!proofFile)
    console.log('   All FormData keys:', Array.from(formData.keys()))
    console.log('   All FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'object' ? '[File]' : value]))

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // 3. Validate task exists and get full details including verification method
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        SubTasks: true,
        Campaign: true,
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // 4. Get user's Twitter username for potential verification
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Account banned' }, { status: 403 })
    }

    if (user.role === 'AMBASSADOR' && !user.twitterUsername) {
      return NextResponse.json(
        { error: 'Twitter username required. Update your profile before submitting.' },
        { status: 400 }
      )
    }

    const participation = await prisma.campaignParticipation.findFirst({
      where: {
        userId: user.id,
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

    let proofImageUrl: string | null = null

    // 4. Handle file upload if provided
    if (proofFile) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'task-proofs')
      await mkdir(uploadsDir, { recursive: true })

      // Generate unique filename
      const fileExtension = proofFile.name.split('.').pop()
      const uniqueFilename = `${randomUUID()}.${fileExtension}`
      const filePath = join(uploadsDir, uniqueFilename)

      // Convert File to Buffer and save
      const bytes = await proofFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Store relative path for database
      proofImageUrl = `/uploads/task-proofs/${uniqueFilename}`
    }

    // 5. Check if submission already exists for this task/subtask combination
    const existingSubmission = await prisma.taskSubmission.findFirst({
      where: {
        taskId: taskId,
        subTaskId: subTaskId || null,
        userId: session.user.id
      }
    })

    if (existingSubmission) {
      const submissionType = subTaskId ? 'subtask' : 'task'
      return NextResponse.json(
        { error: `You have already submitted this ${submissionType}` },
        { status: 400 }
      )
    }

    // 6. If submitting a subtask, validate it exists
    if (subTaskId) {
      const subTask = task.SubTasks?.find((st: any) => st.id === subTaskId)
      if (!subTask) {
        return NextResponse.json(
          { error: 'Subtask not found' },
          { status: 404 }
        )
      }
    }

    // 7. Create task submission
    const submission = await prisma.taskSubmission.create({
      data: {
        taskId: taskId,
        subTaskId: subTaskId || null,
        userId: session.user.id,
        proofImageUrl: proofImageUrl,
        status: 'PENDING', // Will be reviewed by admin or auto-verified
        submittedAt: new Date()
      }
    })

    console.log('✅ Task submission created:', submission.id)
    if (subTaskId) {
      console.log('   📋 Subtask ID:', subTaskId)
    }

    // 8. Trigger Twitter verification for AI-verified tasks ONLY
    const twitterUsername = (user as any)?.twitterUsername
    
    console.log('🔍 Checking verification eligibility:')
    console.log('   - Task verification method:', task.verificationMethod)
    console.log('   - Has subtask ID:', !!subTaskId)
    console.log('   - Twitter username set:', !!twitterUsername)
    
    // ⚠️ CRITICAL: Only run auto-verification for AI_AUTO tasks
    if (task.verificationMethod !== 'AI_AUTO') {
      console.log('   ✋ SKIPPING auto-verification - Task uses MANUAL verification method')
      console.log('   → This task will require admin review')
    } else if (subTaskId && twitterUsername) {
      const subTask = task.SubTasks?.find((st: any) => st.id === subTaskId)
      
      if (subTask && isTwitterVerifiableType(subTask.type)) {
        console.log('🤖 ✅ AI-AUTO verification: All conditions met!')
        console.log('   SubTask Type:', subTask.type)
        console.log('   Twitter Username:', twitterUsername)
        console.log('   SubTask Link:', subTask.link)
        
        // Extract Twitter URL from subtask link
        const twitterUrl = subTask.link
        
        if (twitterUrl) {
          // Map SubTaskType to TaskType for verification API
          const taskType = mapSubTaskTypeToTaskType(subTask.type)
          console.log('   Mapped Task Type:', taskType)
          
          // Run Twitter verification asynchronously (non-blocking)
          runTwitterVerification(
            twitterUrl,
            twitterUsername,
            taskType,
            submission.id
          ).catch((error) => {
            console.error('❌ Twitter verification failed:', error)
            // Don't block submission on verification failure
          })
          
          console.log('   ⏳ Twitter verification started in background')
        } else {
          console.log('   ⚠️ No Twitter URL found in subtask link, skipping verification')
        }
      } else {
        if (!subTask) {
          console.log('   ℹ️ Subtask not found, skipping auto-verification')
        } else {
          console.log('   ℹ️ Subtask type not Twitter-verifiable:', subTask?.type)
        }
      }
    } else {
      if (!subTaskId) {
        console.log('   ℹ️ Main task submission (not subtask), skipping auto-verification')
      } else if (!twitterUsername) {
        console.log('   ⚠️ User has no Twitter username, skipping auto-verification')
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Task submitted successfully',
        submission: {
          id: submission.id,
          status: submission.status
        }
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('❌ Task submission error:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to submit task',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
