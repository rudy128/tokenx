import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: taskId, subtaskId } = resolvedParams
    
    const body = await request.json()
    const { isCompleted } = body

    // Update subtask completion status
    const subtask = await prisma.subTask.update({
      where: { id: subtaskId },
      data: {
        isCompleted: isCompleted ?? false,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(subtask)
  } catch (error) {
    console.error('Subtask update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subtask' },
      { status: 500 }
    )
  }
}
