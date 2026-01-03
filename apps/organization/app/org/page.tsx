import { getOrgUserWithOrg } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { prisma } from '@/lib/prisma'

export default async function OrgDashboard() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const campaignCount = await prisma.campaign.count({
    where: { Organization: { id: data.organization.id } } as any,
  })

  const taskCount = await prisma.task.count({
    where: {
      Campaign: {
        Organization: { id: data.organization.id },
      },
    } as any,
  })

  const pendingSubmissions = await prisma.taskSubmission.count({
    where: {
      Task: {
        Campaign: {
          Organization: { id: data.organization.id },
        },
      },
      status: 'PENDING',
    } as any,
  })

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600 mb-2">Campaigns</p>
            <p className="text-3xl font-bold">{campaignCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600 mb-2">Tasks</p>
            <p className="text-3xl font-bold">{taskCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-gray-600 mb-2">Pending Submissions</p>
            <p className="text-3xl font-bold">{pendingSubmissions}</p>
          </div>
        </div>
      </div>
    </>
  )
}
