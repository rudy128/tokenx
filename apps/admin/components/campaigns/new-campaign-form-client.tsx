"use client"

import dynamic from 'next/dynamic'

const NewCampaignForm = dynamic(
  () => import("@/components/campaigns/new-campaign-form"),
  { ssr: false }
)

interface NewCampaignFormClientProps {
  userId: string
}

export default function NewCampaignFormClient({ userId }: NewCampaignFormClientProps) {
  return <NewCampaignForm userId={userId} />
}
