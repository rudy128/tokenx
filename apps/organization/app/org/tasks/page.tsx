import { getOrgUserWithOrg } from '@/lib/auth'
import Navigation from '@/components/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TasksPage() {
  const data = await getOrgUserWithOrg()
  if (!data) return null

  const tasks = await prisma.task.findMany({
    where: {
      Campaign: {
        Organization: { id: data.organization.id },
      },
    } as any,
    include: {
      Campaign: true,
      SubTasks: true,
      TaskSubmissions: true,
    } as any,
  }) as any[]

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Tasks</h1>
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/org/tasks/${task.id}`}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{task.Campaign.name}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{task.description}</p>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{task.SubTasks.length} subtasks</span>
                <span>{task.TaskSubmissions.length} submissions</span>
              </div>
            </Link>
          ))}
        </div>
        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No tasks yet</p>
          </div>
        )}
      </div>
    </>
  )
}
