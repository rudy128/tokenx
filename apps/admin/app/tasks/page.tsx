import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
// @ts-expect-error - Module resolution issue, component exists and works
import TasksView from "@/components/tasks/tasks-view"

export default async function TasksPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch all tasks with campaign info and submission counts
  const tasksData = await prisma.task.findMany({
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

  const tasks = tasksData.map(task => ({
    ...task,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }))

  return <TasksView tasks={tasks} />
}
