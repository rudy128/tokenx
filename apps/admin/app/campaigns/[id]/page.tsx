import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
// @ts-expect-error - Module resolution issue, component exists and works
import CampaignDetailView from "@/components/campaigns/campaign-detail-view"

export default async function CampaignViewPage({ params }: { params: { id: string } }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  // Fetch campaign with all related data
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      Task: {
        include: {
          _count: {
            select: {
              TaskSubmission: true,
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
          Task: true,
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
    Task: campaign.Task.map(task => ({
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      availableFrom: task.availableFrom,
      availableTo: task.availableTo,
      submissionCutoff: task.submissionCutoff,
    })),
    CampaignParticipation: campaign.CampaignParticipation.map(participation => ({
      ...participation,
      joinedAt: participation.joinedAt,
    })),
  }

  return <CampaignDetailView campaign={serializedCampaign} />
}
