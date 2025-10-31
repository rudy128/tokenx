import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const resolvedParams = await params
    const campaignId = resolvedParams.id
    const taskId = resolvedParams.taskId

    // Try to fetch actual task from database
    let task = null
    try {
      const { prisma } = await import('@/lib/prisma')
      task = await prisma.newTask.findFirst({
        where: {
          id: taskId,
          campaignId: campaignId
        }
      })
    } catch (dbError) {
      console.log('Database query failed, using mock data:', dbError)
    }

    // If actual task found, return it
    if (task) {
      return NextResponse.json({
        id: task.id,
        name: task.name,
        description: task.description,
        instructions: task.instructions || task.description,
        xp: task.xp,
        taskType: task.category || "GENERAL",
        frequency: task.frequency || "once",
        evidenceMode: task.evidenceMode || "MANUAL",
        approvalWorkflow: task.approvalWorkflow || "manual",
        status: task.status,
        createdAt: task.createdAt.toISOString(),
        actionUrl: (task as any).actionUrl || task.instructions || "https://x.com/CubaneSpace",
        campaignId: task.campaignId
      })
    }

    // Fallback to mock data if no actual task found
    const mockCampaignTask = {
      id: taskId,
      name: "Share Campaign Update",
      description: "Share the latest campaign update on your social media platforms",
      instructions: "Post about this campaign on Twitter/X and include the campaign hashtag",
      xp: 75,
      taskType: "SOCIAL_ENGAGEMENT",
      frequency: "once",
      evidenceMode: "MANUAL",
      approvalWorkflow: "manual",
      status: "available",
      createdAt: new Date().toISOString(),
      actionUrl: "https://x.com/CubaneSpace",
      campaignId: campaignId
    }

    return NextResponse.json(mockCampaignTask)
  } catch (error) {
    console.error("Error fetching campaign task:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaign task" },
      { status: 500 }
    )
  }
}