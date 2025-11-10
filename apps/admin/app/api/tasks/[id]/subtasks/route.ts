import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/prisma"

// POST /api/tasks/[id]/subtasks - Create a new subtask
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id
    const body = await request.json()

    const { title, description, link, xpReward, order, type } = body

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

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

    // Create subtask
    const subtask = await prisma.taskSubTask.create({
      data: {
        taskId,
        title: title.trim(),
        description: description?.trim() || null,
        link: link?.trim() || null,
        xpReward: parseInt(String(xpReward)) || 0,
        order: parseInt(String(order)) || 0,
        type: type || 'X_TWEET',
        isCompleted: false,
      },
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("Error creating subtask:", error)
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    )
  }
}
