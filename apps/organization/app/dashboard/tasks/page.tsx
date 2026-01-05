import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import Link from "next/link";

export default async function TasksPage() {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  // Fetch all tasks for this organization with campaign and subtasks
  const tasks = await prisma.task.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      Campaign: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      SubTasks: {
        orderBy: {
          order: "asc",
        },
      },
      _count: {
        select: {
          TaskSubmissions: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  // Group tasks by status - TaskStatus enum: draft, active, archived, completed, cancelled
  const activeTasks = tasks.filter(task => task.status === "active" && task.isActive);
  const draftTasks = tasks.filter(task => task.status === "draft");
  const completedTasks = tasks.filter(task => task.status === "completed");
  const archivedTasks = tasks.filter(task => task.status === "archived");
  const cancelledTasks = tasks.filter(task => task.status === "cancelled");
  const inactiveTasks = tasks.filter(task => !task.isActive && task.status !== "archived" && task.status !== "cancelled");

  // Group tasks by campaign
  const groupTasksByCampaign = (taskList: typeof tasks) => {
    const grouped = new Map<string, { campaign: typeof tasks[0]["Campaign"]; tasks: typeof tasks }>();
    
    taskList.forEach(task => {
      const campaignId = task.Campaign.id;
      if (!grouped.has(campaignId)) {
        grouped.set(campaignId, {
          campaign: task.Campaign,
          tasks: [],
        });
      }
      grouped.get(campaignId)?.tasks.push(task);
    });
    
    return Array.from(grouped.values());
  };

  const activeTasksByCampaign = groupTasksByCampaign(activeTasks);
  const draftTasksByCampaign = groupTasksByCampaign(draftTasks);
  const completedTasksByCampaign = groupTasksByCampaign(completedTasks);
  const archivedTasksByCampaign = groupTasksByCampaign(archivedTasks);
  const cancelledTasksByCampaign = groupTasksByCampaign(cancelledTasks);
  const inactiveTasksByCampaign = groupTasksByCampaign(inactiveTasks);

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "cancelled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage tasks across all campaigns
            </p>
          </div>
          <Link href="/dashboard/tasks/create">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Task
            </button>
          </Link>
        </div>

        {tasks.length === 0 ? (
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
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">No tasks yet</h2>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first task for a campaign
            </p>
            <Link href="/dashboard/tasks/create">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Create Your First Task
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Tasks Section */}
            {activeTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Active Tasks</h2>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-sm font-medium">
                    {activeTasks.length}
                  </span>
                </div>

                {activeTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Draft Tasks Section */}
            {draftTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Draft Tasks</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full text-sm font-medium">
                    {draftTasks.length}
                  </span>
                </div>

                {draftTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-muted-foreground">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full opacity-75">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks Section */}
            {completedTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Completed Tasks</h2>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full text-sm font-medium">
                    {completedTasks.length}
                  </span>
                </div>

                {completedTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-muted-foreground">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full opacity-75">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Archived Tasks Section */}
            {archivedTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Archived Tasks</h2>
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium">
                    {archivedTasks.length}
                  </span>
                </div>

                {archivedTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-muted-foreground">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full opacity-60">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cancelled Tasks Section */}
            {cancelledTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Cancelled Tasks</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 rounded-full text-sm font-medium">
                    {cancelledTasks.length}
                  </span>
                </div>

                {cancelledTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-muted-foreground">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full opacity-60">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Inactive Tasks Section */}
            {inactiveTasksByCampaign.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Inactive Tasks</h2>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full text-sm font-medium">
                    {inactiveTasks.length}
                  </span>
                </div>

                {inactiveTasksByCampaign.map(({ campaign, tasks: campaignTasks }) => (
                  <div key={campaign.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-muted-foreground">{campaign.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {campaignTasks.map((task) => (
                        <Link key={task.id} href={`/dashboard/tasks/${task.id}`}>
                          <div className="rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer h-full opacity-75">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-lg line-clamp-2">{task.name}</h4>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                  </svg>
                                  <span>{task.SubTasks.length} subtasks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                  </svg>
                                  <span>{task._count.TaskSubmissions} submissions</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm pt-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                                  {task.xpReward} XP
                                </span>
                                {task.rewardAmount && (
                                  <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">
                                    {task.rewardAmount.toString()} {task.rewardToken}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
