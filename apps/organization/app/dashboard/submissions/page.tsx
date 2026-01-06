import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import { ReviewDialog } from "@/components/submissions/review-dialog";
import { ExportButton } from "@/components/submissions/export-button";

export default async function SubmissionsPage() {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  // Fetch submissions related to tasks created by this organization
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      Task: {
        organizationId: session.user.organizationId
      }
    },
    include: {
      Task: {
        select: {
          id: true,
          name: true,
          taskType: true,
          xpReward: true,
          campaignId: true,
          Campaign: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true
            }
          },
          SubTasks: {
            select: {
              id: true,
              title: true,
              xpReward: true,
              type: true
            }
          }
        }
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          twitterUsername: true,
          xp: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    },
    take: 50 // Limit for now
  });

  // Calculate status counts
  const statusCounts = await prisma.taskSubmission.groupBy({
    by: ['status'],
    where: {
      Task: {
        organizationId: session.user.organizationId
      }
    },
    _count: true
  });

  const getStatusCount = (status: string) => 
    statusCounts.find(c => c.status === status)?._count || 0;

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
            <p className="text-muted-foreground">
              Review and manage task submissions from ambassadors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors">
              Filter
            </button>
            <ExportButton submissions={submissions} />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Submissions</h3>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-muted-foreground"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Pending Review</h3>
              <svg
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
                 strokeWidth={1.5}
                 stroke="currentColor"
                className="h-4 w-4 text-orange-500"
              >
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{getStatusCount('PENDING')}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Approved</h3>
              <svg
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
                 strokeWidth={1.5}
                 stroke="currentColor"
                className="h-4 w-4 text-green-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{getStatusCount('APPROVED')}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Rejected</h3>
               <svg
                 xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
                 strokeWidth={1.5}
                 stroke="currentColor"
                className="h-4 w-4 text-red-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-2xl font-bold">{getStatusCount('REJECTED')}</div>
          </div>
        </div>

        {/* Tabs for filtering */}
        <div className="border-b">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button className="border-b-2 border-primary py-4 px-1 text-sm font-medium text-primary">
              All
              <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs">0</span>
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border">
              Pending
              <span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs">0</span>
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border">
              Approved
              <span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs">0</span>
            </button>
            <button className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border">
              Rejected
              <span className="ml-2 rounded-full bg-muted px-2.5 py-0.5 text-xs">0</span>
            </button>
          </nav>
        </div>

        {/* Submissions Table Section */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 border-b">
             <h2 className="text-lg font-semibold">All Submissions</h2>
          </div>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground w-12.5">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Task</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Submitted At</th>
                   <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {submissions.length > 0 ? (
                  submissions.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="p-4 align-middle">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                               {item.User.image ? (
                                 // eslint-disable-next-line @next/next/no-img-element
                                 <img src={item.User.image} alt="" className="h-full w-full object-cover" />
                               ) : (
                                 <span className="text-xs font-bold text-slate-500">
                                   {item.User.name?.substring(0, 2).toUpperCase() || 'U'}
                                 </span>
                               )}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-medium">{item.User.name || 'Unknown User'}</span>
                               <span className="text-xs text-muted-foreground">{item.User.email}</span>
                            </div>
                         </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                           <span className="font-medium">{item.Task.name}</span>
                           <span className="text-xs text-muted-foreground uppercase">{item.subTaskId ? 'Sub-Task' : 'Task'}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                         {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
                         <br/>
                         <span className="text-xs text-muted-foreground">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString() : ''}
                         </span>
                      </td>
                      <td className="p-4 align-middle">
                         <div className={`
                           inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold
                           ${item.status === 'PENDING' ? 'border-orange-200 bg-orange-50 text-orange-900' : ''}
                           ${item.status === 'APPROVED' ? 'border-green-200 bg-green-50 text-green-900' : ''}
                           ${item.status === 'REJECTED' ? 'border-red-200 bg-red-50 text-red-900' : ''}
                         `}>
                           {item.status}
                         </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                         <ReviewDialog submission={item} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                       No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
