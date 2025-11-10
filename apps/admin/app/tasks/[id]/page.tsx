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

  return <TaskDetailView task={task} />
}
