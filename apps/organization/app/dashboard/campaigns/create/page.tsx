import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import CreateCampaignForm from "@/components/campaigns/create-campaign-form";

export default async function CreateCampaignPage() {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
          <p className="text-muted-foreground">
            Set up a new campaign to engage with ambassadors
          </p>
        </div>

        <CreateCampaignForm organizationId={session.user.organizationId} />
      </div>
    </DashboardLayout>
  );
}
