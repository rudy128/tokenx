import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import Link from "next/link";

export default async function CampaignsPage() {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  // Fetch all campaigns for this organization
  const campaigns = await prisma.campaign.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      _count: {
        select: {
          Tasks: true,
          CampaignParticipation: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground">
              Create and manage your marketing campaigns
            </p>
          </div>
          <Link href="/dashboard/campaigns/create">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Campaign
            </button>
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-muted-foreground"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No campaigns yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first campaign to engage with ambassadors
            </p>
            <Link href="/dashboard/campaigns/create">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Create Your First Campaign
              </button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Start Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">End Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Participants</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Tasks</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Reward Pool</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(campaign.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(campaign.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {campaign.participantLimit 
                          ? `${campaign._count.CampaignParticipation} / ${campaign.participantLimit}`
                          : campaign._count.CampaignParticipation
                        }
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {campaign._count.Tasks}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {campaign.rewardPool.toLocaleString()} {campaign.rewardToken}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link 
                            href={`/dashboard/campaigns/${campaign.id}`}
                            className="text-primary hover:underline text-sm font-medium"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="text-blue-600 hover:underline text-sm font-medium dark:text-blue-400"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
