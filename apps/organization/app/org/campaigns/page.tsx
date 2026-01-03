import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CampaignsPage() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const canCreateCampaigns = hasPermission(
    data.membership.permissions as Record<string, boolean> | null,
    'can_create_campaigns'
  )

  const campaigns = await prisma.campaign.findMany({
    where: { Organization: { id: data.organization.id } } as any,
    include: {
      Tasks: {
        select: { id: true },
      },
    } as any,
  }) as any[]

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          {canCreateCampaigns && (
            <Link
              href="/org/campaigns/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              New Campaign
            </Link>
          )}
        </div>
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/org/campaigns/${campaign.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 cursor-pointer"
            >
              <h3 className="font-semibold text-lg mb-2">{campaign.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
              <div className="flex gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {campaign.status}
                </span>
                <span className="text-gray-500">{campaign.Tasks.length} tasks</span>
              </div>
            </Link>
          ))}
        </div>
        {campaigns.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No campaigns yet</p>
            {canCreateCampaigns && (
              <Link href="/org/campaigns/new" className="text-blue-600 hover:text-blue-700">
                Create your first campaign
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
