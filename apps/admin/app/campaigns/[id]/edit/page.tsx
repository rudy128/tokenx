import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditCampaignForm from "@/components/campaigns/edit-campaign-form"

interface EditCampaignPageProps {
  params: {
    id: string
  }
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch campaign by ID
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
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
