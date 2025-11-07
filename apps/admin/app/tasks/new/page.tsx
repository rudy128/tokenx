import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
// @ts-expect-error - module resolution issue
import NewTaskForm from "@/components/tasks/new-task-form"

export default async function NewTaskPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch all active campaigns for the dropdown
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: {
        in: ["ACTIVE", "DRAFT"],
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <NewTaskForm 
      campaigns={campaigns}
      userId={session.user.id as string}
    />
  )
}
