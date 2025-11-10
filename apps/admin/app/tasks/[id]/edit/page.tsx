import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditTaskForm from "@/components/tasks/edit-task-form"

interface EditTaskPageProps {
  params: {
    id: string
  }
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch task with campaign and subtasks
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      Campaign: {
        select: {
          id: true,
          name: true,
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

  // Fetch all campaigns for the dropdown
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Serialize dates
  const serializedTask = {
    ...task,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    taskSubTasks: task.taskSubTasks.map(subtask => ({
      ...subtask,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
    })),
  }

  return (
    <EditTaskForm 
      task={serializedTask}
      campaigns={campaigns}
      userId={session.user.id as string}
    />
  )
}
