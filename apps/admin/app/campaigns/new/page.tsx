import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import dynamic from "next/dynamic"

// Dynamic import to help with TypeScript resolution
const NewCampaignForm = dynamic(
  () => import("@/components/campaigns/new-campaign-form"),
  { ssr: false }
)

export default async function NewCampaignPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const userId = session.user.id as string

  return <NewCampaignForm userId={userId} />
}
