import { getOrganizationSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getOrganizationSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Redirect authenticated users to dashboard
  redirect("/dashboard");
}
