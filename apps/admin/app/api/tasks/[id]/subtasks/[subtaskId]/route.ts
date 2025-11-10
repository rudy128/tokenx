import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/prisma"

// PATCH /api/tasks/[id]/subtasks/[subtaskId] - Update a subtask
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const { subtaskId } = params
    const body = await request.json()

    const { title, description, link, xpReward, order, type } = body

    // Check if subtask exists
    const existingSubtask = await prisma.taskSubTask.findUnique({
      where: { id: subtaskId },
    })

    if (!existingSubtask) {
      return NextResponse.json(
        { error: "Subtask not found" },
        { status: 404 }
      )
    }

    // Update subtask
    const updatedSubtask = await prisma.taskSubTask.update({
      where: { id: subtaskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(link !== undefined && { link: link?.trim() || null }),
        ...(xpReward !== undefined && { xpReward: parseInt(String(xpReward)) || 0 }),
        ...(order !== undefined && { order: parseInt(String(order)) || 0 }),
        ...(type !== undefined && { type: type || 'X_TWEET' }),
      },
    })

    return NextResponse.json(updatedSubtask)
  } catch (error) {
    console.error("Error updating subtask:", error)
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id]/subtasks/[subtaskId] - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; subtaskId: string } }
) {
  try {
    const { subtaskId } = params

    // Check if subtask exists
    const existingSubtask = await prisma.taskSubTask.findUnique({
      where: { id: subtaskId },
    })

    if (!existingSubtask) {
      return NextResponse.json(
        { error: "Subtask not found" },
        { status: 404 }
      )
    }

    // Delete subtask
    await prisma.taskSubTask.delete({
      where: { id: subtaskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subtask:", error)
    return NextResponse.json(
      { error: "Failed to delete subtask" },
      { status: 500 }
    )
  }
}
