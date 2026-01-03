import { getOrgUserWithOrg } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { prisma } from '@/lib/prisma'

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      Campaign: true,
      SubTasks: true,
      TaskSubmissions: {
        include: {
          User: true,
        },
      },
    } as any,
  }) as any

  if (!task || task.Campaign.organizationId !== data.organization.id) {
    return <div className="p-8">Task not found</div>
  }

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2">{task.name}</h1>
        <p className="text-gray-600 mb-8">{task.description}</p>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Subtasks</h2>
            <div className="space-y-2">
              {task.SubTasks.map((st: any) => (
                <div key={st.id} className="bg-white border border-gray-200 rounded p-3">
                  <p className="font-medium">{st.title}</p>
                  <p className="text-sm text-gray-600">{st.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Submissions ({task.TaskSubmissions.length})</h2>
            <div className="space-y-2">
              {task.TaskSubmissions.map((sub: any) => (
                <div key={sub.id} className="bg-white border border-gray-200 rounded p-3">
                  <p className="font-medium">{sub.User.name}</p>
                  <p className="text-sm text-gray-600">Status: {sub.status}</p>
                  <p className="text-xs text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
