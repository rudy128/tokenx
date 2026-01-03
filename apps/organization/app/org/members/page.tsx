import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { prisma } from '@/lib/prisma'

export default async function MembersPage() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const members = await (prisma as any).organizationMember.findMany({
    where: { organization: { id: data.organization.id } },
    include: { user: true },
  }) as any[]

  const canManageMembers = hasPermission(
    data.membership.permissions as Record<string, boolean> | null,
    'can_manage_members'
  )

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Members</h1>
          {canManageMembers && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Invite Member
            </button>
          )}
        </div>
        <div className="grid gap-4">
          {members.map((member: any) => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{member.user.name}</p>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                  <p className="text-xs text-gray-500 mt-2">Role: {member.role}</p>
                </div>
                {canManageMembers && (
                  <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
