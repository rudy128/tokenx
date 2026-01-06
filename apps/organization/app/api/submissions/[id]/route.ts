import { NextRequest, NextResponse } from "next/server"
import { getOrganizationSession } from "@/lib/session"
import { prisma } from "@repo/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getOrganizationSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const submissionId = resolvedParams.id
    const body = await request.json()
    const { action, reviewNotes } = body

    // Validate action
    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVED or REJECTED" },
        { status: 400 }
      )
    }

    // First verify the submission belongs to a task owned by this organization
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        Task: {
          select: {
            organizationId: true,
            xpReward: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    if (submission.Task.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized to review this submission" },
        { status: 403 }
      )
    }

    // Update the submission
    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: action,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reviewNotes || null,
        processedAt: new Date(),
        // Award XP if approved
        ...(action === 'APPROVED' && {
          xpAwarded: submission.Task.xpReward
        })
      }
    })

    // If approved, update user's XP
    if (action === 'APPROVED') {
      await prisma.user.update({
        where: { id: submission.userId },
        data: {
          xp: {
            increment: submission.Task.xpReward
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission
    })

  } catch (error) {
    console.error('Submission review error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission review' },
      { status: 500 }
    )
  }
}
