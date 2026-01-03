import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import CampaignDetailView from "@/components/campaigns/campaign-detail-view"

export default async function CampaignViewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const { id } = await params

  // Fetch campaign with all related data
  const campaign = await prisma.campaign.findUnique({
    where: {
      id,
    },
    include: {
      Creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      Tasks: {
        include: {
          _count: {
            select: {
              TaskSubmissions: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      CampaignParticipation: {
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
          joinedAt: "desc",
        },
      },
      _count: {
        select: {
          CampaignParticipation: true,
          Tasks: true,
        },
      },
    },
  })

  if (!campaign) {
    notFound()
  }

  // Serialize dates for client component
  const serializedCampaign = {
    ...campaign,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    Tasks: campaign.Tasks.map(task => ({
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })),
    CampaignParticipation: campaign.CampaignParticipation.map(participation => ({
      ...participation,
      joinedAt: participation.joinedAt,
    })),
  }

  return <CampaignDetailView campaign={serializedCampaign} />
}
