import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/dashboard"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/sign-in")
  }

  return <AdminDashboard user={session.user} />
}
