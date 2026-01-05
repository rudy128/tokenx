import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import { getOrganizationSession } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getOrganizationSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Tasks: true,
            CampaignParticipation: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Verify the campaign belongs to the user's organization
    if (campaign.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: Organization mismatch" },
        { status: 403 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("❌ Get campaign error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getOrganizationSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const {
      organizationId,
      name,
      description,
      startDate,
      endDate,
      participationLimit,
      eligibilityCriteria,
      rewardPool,
      rewardToken,
      status,
    } = body;

    console.log("🟡 Updating campaign:", { id, name, status });

    // Verify the organization belongs to the user
    if (organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: Organization mismatch" },
        { status: 403 }
      );
    }

    // Check if campaign exists and belongs to the organization
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (existingCampaign.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: Organization mismatch" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !rewardPool || !rewardToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        description,
        startDate: start,
        endDate: end,
        participantLimit: participationLimit || null,
        eligibilityCriteria: eligibilityCriteria || null,
        rewardPool: Number(rewardPool),
        rewardToken,
        status: status || "DRAFT",
      },
    });

    console.log("✅ Campaign updated:", campaign.id);

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Campaign update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getOrganizationSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    console.log("🔴 Deleting campaign:", { id });

    // Check if campaign exists and belongs to the organization
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (existingCampaign.organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: Organization mismatch" },
        { status: 403 }
      );
    }

    // Delete campaign
    await prisma.campaign.delete({
      where: { id },
    });

    console.log("✅ Campaign deleted:", id);

    return NextResponse.json(
      { success: true, message: "Campaign deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Campaign deletion error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the campaign" },
      { status: 500 }
    );
  }
}
