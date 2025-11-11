import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditCampaignForm from "@/components/campaigns/edit-campaign-form"

interface EditCampaignPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { id } = await params

  // Fetch campaign by ID
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  return (
    <EditCampaignForm 
      campaign={campaign}
      userId={session.user.id as string}
    />
  )
}
