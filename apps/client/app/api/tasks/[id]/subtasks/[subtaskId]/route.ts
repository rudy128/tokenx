import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth" 

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const { id: taskId, subtaskId } = resolvedParams
    
    const body = await request.json()
    const { isCompleted } = body

    // We shouldn't update the SubTask definition itself (which is global/admin defined).
    // Instead we should create/update a TaskSubmission record for this user + task + subtask.

    console.log(`📝 Processing submission for User: ${session.user.id}, Task: ${taskId}, SubTask: ${subtaskId}`)

    if (isCompleted) {
        // Create or update submission to PENDING (or APPROVED depending on workflow, sticking to PENDING/Submitted per request)
        const submission = await prisma.taskSubmission.upsert({
            where: {
                taskId_userId_subTaskId: {
                    taskId: taskId,
                    userId: session.user.id,
                    subTaskId: subtaskId
                }
            },
            create: {
                taskId: taskId,
                userId: session.user.id,
                subTaskId: subtaskId,
                status: 'PENDING', // Mapped to 'Submitted' / 'Under Review' in UI
                submittedAt: new Date(),
                // Optional fields left null as requested
            },
            update: {
                status: 'PENDING',
                submittedAt: new Date(),
            }
        })
        return NextResponse.json(submission)
    } else {
        // If isCompleted is false, it means reverting submission (if that's allowed)
        // For now, let's just delete the submission or set status to something else? 
        // User request implied one-way "submit", but if we need to toggle off:
        
        // Option A: Delete the submission record
        /*
        await prisma.taskSubmission.delete({
            where: {
                taskId_userId_subTaskId: {
                    taskId: taskId,
                    userId: session.user.id,
                    subTaskId: subtaskId
                }
            }
        })
        */
        
        // For now, I'll return success but log that revert isn't fully implemented or needed yet based on "submit button" flow.
        return NextResponse.json({ message: "Reverted (No-op)" })
    }

  } catch (error) {
    console.error('Subtask submission error:', error)
    return NextResponse.json(
      { error: 'Failed to update subtask' },
      { status: 500 }
    )
  }
}
