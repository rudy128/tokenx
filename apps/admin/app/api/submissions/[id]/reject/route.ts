import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params
    const body = await request.json()
    const { reason } = body

    console.log('🔍 Rejecting submission:', submissionId, 'Reason:', reason)

    // Update submission status
    await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewNotes: reason || "Rejected by admin",
      },
    })

    console.log('✅ Submission rejected')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ Error rejecting submission:", error)
    return NextResponse.json(
      { error: "Failed to reject submission" },
      { status: 500 }
    )
  }
}
