import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import TaskDetailView from "@/components/tasks/task-detail-view"

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { id: taskId } = await params

  // Fetch task with submissions
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      Campaign: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      TaskSubmission: {
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      },
      taskSubTasks: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  if (!task) {
    notFound()
  }

  // Map task data to match TaskDetailView interface
  const taskData = {
    id: task.id,
    title: task.name,
    description: task.description,
    xpReward: task.xpReward,
    status: task.status,
    verificationMethod: task.verificationMethod,
    Campaign: task.Campaign,
    TaskSubmission: task.TaskSubmission,
    campaign: task.Campaign ? {
      id: task.Campaign.id,
      name: task.Campaign.name,
      slug: task.Campaign.id, // Using id as slug since Campaign doesn't have slug
      status: task.Campaign.status,
    } : undefined,
    subTasks: task.taskSubTasks.map(st => ({
      id: st.id,
      title: st.title,
      description: st.description,
      link: st.link,
      xpReward: st.xpReward,
      order: st.order,
      isCompleted: st.isCompleted,
      isUploadProof: st.isUploadProof,
    })),
    _count: {
      submissions: task.TaskSubmission.length,
    },
  }

  return <TaskDetailView task={taskData} />
}
