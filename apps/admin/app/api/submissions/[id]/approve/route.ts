import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params
    
    console.log('🔍 Approving submission:', submissionId)

    // Get submission to award XP
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: {
        Task: true,
      },
    })

    console.log('📋 Submission found:', submission)

    if (!submission) {
      console.log('❌ Submission not found')
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    // Update submission status
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
      },
    })

    console.log('✅ Submission status updated')

    // Award XP to user
    await prisma.user.update({
      where: { id: submission.userId },
      data: {
        xp: {
          increment: submission.Task.xpReward,
        },
      },
    })

    console.log('✅ XP awarded to user:', submission.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error approving submission:", error)
    return NextResponse.json(
      { error: "Failed to approve submission" },
      { status: 500 }
    )
  }
}
