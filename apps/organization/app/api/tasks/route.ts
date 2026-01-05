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
      campaignId,
      name,
      description,
      instructions,
      category,
      taskType,
      xpReward,
      rewardAmount,
      rewardToken,
      verificationMethod,
      status,
      frequency,
      isActive,
      perUserCap,
      globalCap,
      availableFrom,
      availableTo,
      minAccountAgeDays,
      minFollowers,
      uniqueContent,
      subTasks,
    } = body;

    console.log("🟢 Creating task:", { name, campaignId, organizationId });

    // Verify the organization belongs to the user
    if (organizationId !== session.user.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized: Organization mismatch" },
        { status: 403 }
      );
    }

    // Verify the campaign belongs to the organization
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Campaign not found or does not belong to your organization" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!name || !campaignId || xpReward === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create task with subtasks
    const task = await prisma.task.create({
      data: {
        campaignId,
        organizationId,
        name,
        description: description || null,
        instructions: instructions || null,
        category: category || "CUSTOM",
        taskType: taskType || "GENERAL",
        xpReward: Number(xpReward),
        rewardAmount: rewardAmount ? Number(rewardAmount) : null,
        rewardToken: rewardToken || null,
        verificationMethod: verificationMethod || "MANUAL",
        status: status || "draft",
        frequency: frequency || "one_time",
        isActive: isActive !== undefined ? isActive : true,
        perUserCap: perUserCap ? Number(perUserCap) : null,
        globalCap: globalCap ? Number(globalCap) : null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        minAccountAgeDays: minAccountAgeDays ? Number(minAccountAgeDays) : null,
        minFollowers: minFollowers ? Number(minFollowers) : null,
        uniqueContent: uniqueContent !== undefined ? uniqueContent : true,
        createdById: session.user.id,
        createdByRole: "ORGANIZATION",
        SubTasks: subTasks && subTasks.length > 0 ? {
          create: subTasks.map((st: {
            title: string;
            description?: string | null;
            link?: string | null;
            xpReward?: number;
            type: string;
            isUploadProof?: boolean;
            order?: number;
          }) => ({
            title: st.title,
            description: st.description || null,
            link: st.link || null,
            xpReward: Number(st.xpReward) || 0,
            type: st.type,
            isUploadProof: st.isUploadProof || false,
            order: st.order || 0,
          })),
        } : undefined,
      },
      include: {
        SubTasks: true,
      },
    });

    console.log("✅ Task created:", task.id);

    return NextResponse.json(
      {
        success: true,
        task: {
          id: task.id,
          name: task.name,
          status: task.status,
          subTasksCount: task.SubTasks.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Task creation error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the task" },
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

    // Fetch all tasks for the organization
    const tasks = await prisma.task.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        Campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        SubTasks: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            TaskSubmissions: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("❌ Get tasks error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching tasks" },
      { status: 500 }
    );
  }
}
