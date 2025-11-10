import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params

    console.log('🔧 Disabling AI for task:', taskId)

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // Check if task has AI verification
    if (task.verificationMethod !== 'AI_AUTO' && task.verificationMethod !== 'HYBRID') {
      return NextResponse.json(
        { error: "Task does not use AI verification" },
        { status: 400 }
      )
    }

    console.log('📝 Current verification method:', task.verificationMethod)

    // Update task to MANUAL verification
    await prisma.task.update({
      where: { id: taskId },
      data: {
        verificationMethod: 'MANUAL',
      },
    })

    console.log('✅ AI verification disabled, switched to MANUAL')

    return NextResponse.json({ 
      success: true,
      message: 'AI verification disabled successfully',
      previousMethod: task.verificationMethod,
      newMethod: 'MANUAL'
    })
  } catch (error) {
    console.error("❌ Error disabling AI:", error)
    return NextResponse.json(
      { error: "Failed to disable AI verification" },
      { status: 500 }
    )
  }
}
