import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// PATCH - Update campaign
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = session.user as { id: string; role?: UserRole }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    const {
      name,
      description,
      startDate,
      endDate,
      participantLimit,
      eligibilityCriteria,
      rewardPool,
      rewardToken,
      status,
    } = body

    // Validation
    if (!name || !description || !startDate || !endDate || rewardPool === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    if (parseFloat(rewardPool) <= 0) {
      return NextResponse.json(
        { error: "Reward pool must be greater than 0" },
        { status: 400 }
      )
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        participantLimit: participantLimit ? parseInt(participantLimit) : null,
        eligibilityCriteria: eligibilityCriteria?.trim() || null,
        rewardPool: parseFloat(rewardPool),
        rewardToken: rewardToken || "USDT",
        status: status || "DRAFT",
        updatedAt: new Date(),
      },
      include: {
        Creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        campaign: updatedCampaign,
        message: "Campaign updated successfully",
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error updating campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = session.user as { id: string; role?: UserRole }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            CampaignParticipation: true,
            Tasks: true,
          },
        },
      },
    })

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Check if campaign has participants or tasks
    if (existingCampaign._count.CampaignParticipation > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign with participants. Consider marking it as cancelled instead." },
        { status: 400 }
      )
    }

    if (existingCampaign._count.Tasks > 0) {
      return NextResponse.json(
        { error: "Cannot delete campaign with tasks. Consider marking it as cancelled instead." },
        { status: 400 }
      )
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Campaign deleted successfully",
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error deleting campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get single campaign (optional, for future use)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        Creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            CampaignParticipation: true,
            Tasks: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { campaign },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error fetching campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
