import { getOrgUserWithOrg } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      Tasks: {
        include: {
          SubTasks: true,
          TaskSubmissions: true,
        },
      },
    } as any,
  }) as any

  if (!campaign || campaign.organizationId !== data.organization.id) {
    return <div className="p-8">Campaign not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <Link href="/org/campaigns" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
        ← Back to Campaigns
      </Link>
      <h1 className="text-3xl font-bold mb-2">{campaign.name}</h1>
      <p className="text-gray-600 mb-8">{campaign.description}</p>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tasks ({campaign.Tasks.length})</h2>
        <div className="space-y-3">
          {campaign.Tasks.map((task: any) => (
            <Link
              key={task.id}
              href={`/org/tasks/${task.id}`}
              className="block bg-gray-50 border border-gray-200 rounded p-4 hover:border-blue-500 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{task.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{task.SubTasks.length} subtasks</p>
                  <p>{task.TaskSubmissions.length} submissions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {campaign.Tasks.length === 0 && <p className="text-gray-600">No tasks in this campaign</p>}
      </div>
    </div>
  )
}
