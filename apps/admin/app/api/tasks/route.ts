import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = session.user as { id: string; role?: UserRole }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")
    const status = searchParams.get("status")

    // Build where clause
    const where: Record<string, string> = {}
    if (campaignId) where.campaignId = campaignId
    if (status) where.status = status

    const tasks = await prisma.task.findMany({
      where,
      include: {
        Campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        SubTasks: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            TaskSubmissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Convert dates to ISO strings for JSON serialization
    const tasksData = tasks.map((task) => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks: tasksData,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}
