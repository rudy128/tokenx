import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import EditTaskForm from "@/components/tasks/edit-task-form";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;
  const session = await getOrganizationSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get the organization member
  const member = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: true,
    },
  });

  if (!member) {
    redirect("/unauthorized");
  }

  // Get the task with all details
  const task = await prisma.task.findUnique({
    where: {
      id,
    },
    include: {
      Campaign: true,
      SubTasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!task) {
    redirect("/dashboard/tasks");
  }

  // Verify the task belongs to this organization
  if (task.Campaign.organizationId !== member.organizationId) {
    redirect("/unauthorized");
  }

  // Convert Decimal to number for form
  const taskData = {
    ...task,
    rewardAmount: task.rewardAmount ? Number(task.rewardAmount) : null,
  };

  // Get all campaigns for this organization
  const campaigns = await prisma.campaign.findMany({
    where: {
      organizationId: member.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground mt-2">
            Update task details, rewards, and settings
          </p>
        </div>

        <EditTaskForm
          task={taskData}
          campaigns={campaigns}
          organizationId={member.organizationId}
        />
      </div>
    </DashboardLayout>
  );
}
