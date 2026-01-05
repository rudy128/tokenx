import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import { getOrganizationSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getOrganizationSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    console.log("🟢 Creating campaign:", { name, organizationId, status });

    // Verify the organization belongs to the user
    if (organizationId !== session.user.organizationId) {
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

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        organizationId,
        name,
        description,
        startDate: start,
        endDate: end,
        participantLimit: participationLimit || null,
        eligibilityCriteria: eligibilityCriteria || null,
        rewardPool: Number(rewardPool),
        rewardToken,
        status: status || "DRAFT",
        createdById: session.user.id,
        createdByRole: "ORGANIZATION",
      },
    });

    console.log("✅ Campaign created:", campaign.id);

    return NextResponse.json(
      {
        success: true,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Campaign creation error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the campaign" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getOrganizationSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get campaigns for the organization
    const campaigns = await prisma.campaign.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            Tasks: true,
            CampaignParticipation: true,
          },
        },
      },
    });

    return NextResponse.json({ campaigns }, { status: 200 });
  } catch (error) {
    console.error("❌ Campaigns fetch error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching campaigns" },
      { status: 500 }
    );
  }
}
