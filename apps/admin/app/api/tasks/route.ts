import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const tasks = await prisma.task.findMany({
      include: {
        Campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
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
    const tasksData = tasks.map(task => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }))

    return NextResponse.json(tasksData)
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
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      campaignId,
      name,
      description,
      category,
      xpReward,
      verificationMethod,
      requirements,
      status,
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
        { error: "Description is required" },
        { status: 400 }
      )
    }

    if (!category || !["SOCIAL_ENGAGEMENT", "CONTENT_CREATION", "COMMUNITY_BUILDING", "REFERRAL", "CUSTOM"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      )
    }

    if (!xpReward || typeof xpReward !== "number" || xpReward <= 0) {
      return NextResponse.json(
        { error: "XP reward must be a positive number" },
        { status: 400 }
      )
    }

    if (!verificationMethod || !["AI_AUTO", "MANUAL", "HYBRID"].includes(verificationMethod)) {
      return NextResponse.json(
        { error: "Invalid verification method" },
        { status: 400 }
      )
    }

    if (status && !["draft", "active", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
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

    // Create task
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
      },
      include: {
        Campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: {
          ...task,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
