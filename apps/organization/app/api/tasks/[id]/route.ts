import { NextResponse } from "next/server";
import { getOrganizationSession } from "@/lib/session";
import { prisma } from "@repo/prisma";
import { Prisma } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const session = await getOrganizationSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the organization member
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Organization member not found" },
        { status: 404 }
      );
    }

    // Verify the task belongs to this organization
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        Campaign: true,
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (existingTask.Campaign.organizationId !== member.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized to edit this task" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
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

    // Verify the campaign belongs to the organization
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.organizationId !== member.organizationId) {
      return NextResponse.json(
        { error: "Invalid campaign" },
        { status: 400 }
      );
    }

    // Update task and subtasks in a transaction
    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update the task
      const task = await tx.task.update({
        where: { id },
        data: {
          campaignId,
          name,
          description,
          instructions,
          category,
          taskType,
          xpReward,
          rewardAmount: rewardAmount ? new Prisma.Decimal(rewardAmount) : null,
          rewardToken,
          verificationMethod,
          status,
          frequency,
          isActive,
          perUserCap,
          globalCap,
          availableFrom: availableFrom ? new Date(availableFrom) : null,
          availableTo: availableTo ? new Date(availableTo) : null,
          minAccountAgeDays,
          minFollowers,
          uniqueContent,
        },
      });

      // Handle subtasks
      if (subTasks && Array.isArray(subTasks)) {
        // Get existing subtask IDs
        const existingSubTaskIds = subTasks
          .filter((st: { id?: string }) => st.id)
          .map((st: { id: string }) => st.id);

        // Delete subtasks that are no longer in the list
        await tx.subTask.deleteMany({
          where: {
            taskId: id,
            id: {
              notIn: existingSubTaskIds,
            },
          },
        });

        // Upsert subtasks
        for (let i = 0; i < subTasks.length; i++) {
          const subTask = subTasks[i];
          const subTaskData = {
            title: subTask.title,
            description: subTask.description,
            link: subTask.link,
            xpReward: subTask.xpReward,
            type: subTask.type,
            isUploadProof: subTask.isUploadProof,
            order: i,
            taskId: id,
          };

          if (subTask.id) {
            // Update existing subtask
            await tx.subTask.update({
              where: { id: subTask.id },
              data: subTaskData,
            });
          } else {
            // Create new subtask
            await tx.subTask.create({
              data: subTaskData,
            });
          }
        }
      }

      return task;
    });

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
