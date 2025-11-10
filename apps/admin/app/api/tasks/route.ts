import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
        taskSubTasks: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            TaskSubmission: true,
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

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = session.user as { id: string; role?: string }
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    console.log("📝 Received task data:", JSON.stringify(body, null, 2))

    const {
      campaignId,
      name,
      description,
      category,
      xpReward,
      verificationMethod,
      requirements,
      status,
      subTasks = [],
    } = body

    // Validation
    if (!campaignId || typeof campaignId !== "string") {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Task name is required" },
        { status: 400 }
      )
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Task description is required" },
        { status: 400 }
      )
    }

    if (!xpReward || typeof xpReward !== "number" || xpReward <= 0) {
      return NextResponse.json(
        { error: "XP reward must be a positive number" },
        { status: 400 }
      )
    }

    if (status && !["draft", "active", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Validate subtasks if provided
    if (subTasks && Array.isArray(subTasks)) {
      for (let i = 0; i < subTasks.length; i++) {
        const subTask = subTasks[i]
        if (!subTask.title || subTask.title.trim() === "") {
          return NextResponse.json(
            { error: `Subtask ${i + 1}: Title is required` },
            { status: 400 }
          )
        }
      }
    }

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // 3. Create task with subtasks in a single transaction
    const task = await prisma.task.create({
      data: {
        campaignId,
        name: name.trim(),
        description: description.trim(),
        category,
        xpReward,
        verificationMethod,
        requirements: requirements || null,
        status: status || "draft",
        taskSubTasks: subTasks && Array.isArray(subTasks) && subTasks.length > 0 ? {
          create: subTasks.map((subTask: { title: string; link?: string; xpReward: number; isUploadProof?: boolean; type?: string }, index: number) => ({
            title: subTask.title.trim(),
            link: subTask.link?.trim() || null,
            xpReward: parseInt(String(subTask.xpReward)) || 0,
            order: index,
            isCompleted: false,
            isUploadProof: subTask.isUploadProof || false,
            type: subTask.type || 'X_TWEET',
          }))
        } : undefined,
      },
      include: {
        Campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        taskSubTasks: {
          orderBy: { order: "asc" },
        },
      },
    })

    console.log("✅ Task created successfully:", task.id)
    console.log("✅ Subtasks created:", task.taskSubTasks.length)

    // 4. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task: {
          id: task.id,
          title: task.name,
          subtaskCount: task.taskSubTasks.length,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    console.error("❌ Task creation error:", error)
    const err = error as { code?: string; message?: string }

    // Handle specific Prisma errors
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "A task with this name already exists in this campaign" },
        { status: 400 }
      )
    }

    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid reference - Campaign or user not found" },
        { status: 400 }
      )
    }

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Related record not found" },
        { status: 404 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Failed to create task",
        details: process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    )
  }
}
