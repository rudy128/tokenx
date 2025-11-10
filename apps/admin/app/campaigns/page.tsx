import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CampaignsView from "@/components/campaigns/campaigns-view"

export default async function CampaignsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch all campaigns with creator info and counts
  const campaignsData = await prisma.campaign.findMany({
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          CampaignParticipation: true,
          Task: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Serialize dates for client component
  const campaigns = campaignsData.map(campaign => ({
    ...campaign,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  }))

  return <CampaignsView campaigns={campaigns} />
}
