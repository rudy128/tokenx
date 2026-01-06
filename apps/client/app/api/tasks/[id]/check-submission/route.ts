import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('🔍 Checking submission for task:', taskId, 'user:', user.id)

    // Check for existing submission in TaskSubmission
    const taskSubmission = await prisma.taskSubmission.findFirst({
      where: {
        taskId,
        userId: user.id
      }
    })

    console.log('📋 TaskSubmission:', taskSubmission)

    const hasSubmitted = !!taskSubmission

    console.log('✅ Has submitted:', hasSubmitted)

    return NextResponse.json({ hasSubmitted })
  } catch (error) {
    console.error('Error checking submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
