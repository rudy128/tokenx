import { redirect, notFound } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import EditCampaignForm from "@/components/campaigns/edit-campaign-form";

interface EditCampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Fetch the campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          Tasks: true,
          CampaignParticipation: true,
        },
      },
    },
  });

  // Check if campaign exists
  if (!campaign) {
    notFound();
  }

  // Verify the campaign belongs to the user's organization
  if (campaign.organizationId !== session.user.organizationId) {
    redirect("/unauthorized");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground">
            Update your campaign details
          </p>
        </div>

        <EditCampaignForm 
          campaign={campaign}
          organizationId={session.user.organizationId}
        />
      </div>
    </DashboardLayout>
  );
}
