import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import NewCampaignFormClient from "@/components/campaigns/new-campaign-form-client"

export default async function NewCampaignPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const userId = session.user.id as string

  return <NewCampaignFormClient userId={userId} />
}
