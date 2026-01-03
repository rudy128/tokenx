import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { SubmissionAction } from '@/components/submission-action'
import { prisma } from '@/lib/prisma'

export default async function SubmissionsPage() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const submissions = await prisma.taskSubmission.findMany({
    where: {
      Task: {
        Campaign: {
          Organization: { id: data.organization.id },
        },
      },
    } as any,
    include: {
      User: true,
      Task: {
        include: {
          Campaign: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }) as any[]

  const canApprove = hasPermission(
    data.membership.permissions as Record<string, boolean> | null,
    'can_approve_submissions'
  )

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Submissions</h1>
        <div className="grid gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold">{sub.User.name}</p>
                  <p className="text-sm text-gray-600">{sub.Task.name}</p>
                  <p className="text-xs text-gray-500">{sub.Task.Campaign.name}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    sub.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : sub.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {sub.status}
                </span>
              </div>
              {canApprove && sub.status === 'PENDING' && (
                <div className="flex gap-2">
                  <SubmissionAction submissionId={sub.id} action="approve" />
                  <SubmissionAction submissionId={sub.id} action="reject" />
                </div>
              )}
            </div>
          ))}
        </div>
        {submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No submissions yet</p>
          </div>
        )}
      </div>
    </>
  )
}
