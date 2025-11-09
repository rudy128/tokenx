import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

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
    const userId = formData.get('userId') as string
    const proofFile = formData.get('proofFile') as File | null

    // 🔍 DEBUG: Log what we received
    console.log('📥 API Route - Received FormData:')
    console.log('   Task ID:', taskId)
    console.log('   Subtask ID:', subTaskId)
    console.log('   User ID:', userId)
    console.log('   Has Proof File:', !!proofFile)
    console.log('   All FormData keys:', Array.from(formData.keys()))
    console.log('   All FormData entries:', Array.from(formData.entries()).map(([key, value]) => [key, typeof value === 'object' ? '[File]' : value]))

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // 3. Validate task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        taskSubTasks: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
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
      const subTask = task.taskSubTasks?.find((st: any) => st.id === subTaskId)
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
        id: randomUUID(),
        taskId: taskId,
        subTaskId: subTaskId || null,
        userId: session.user.id,
        proofImageUrl: proofImageUrl,
        status: 'PENDING', // Will be reviewed by admin
        submittedAt: new Date()
      }
    })

    console.log('✅ Task submission created:', submission.id)
    if (subTaskId) {
      console.log('   📋 Subtask ID:', subTaskId)
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
