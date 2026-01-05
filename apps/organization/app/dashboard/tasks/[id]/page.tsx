import { redirect, notFound } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";
import Link from "next/link";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Fetch the task with all details
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      Campaign: {
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true,
        },
      },
      SubTasks: {
        orderBy: {
          order: "asc",
        },
      },
      TaskSubmissions: {
        where: {
          status: "APPROVED",
        },
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              twitterUsername: true,
            },
          },
        },
        orderBy: {
          submittedAt: "asc",
        },
        take: 3, // Get top 3 early completers
      },
      _count: {
        select: {
          TaskSubmissions: true,
        },
      },
    },
  });

  // Check if task exists
  if (!task) {
    notFound();
  }

  // Verify the task belongs to the user's organization
  if (task.organizationId !== session.user.organizationId) {
    redirect("/unauthorized");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "archived":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Helper to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout 
      organizationName={organization?.name}
      userEmail={session.user.email || undefined}
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/tasks" className="hover:text-foreground">
            Tasks
          </Link>
          <span>/</span>
          <span className="text-foreground">{task.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              {!task.isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  Inactive
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-muted-foreground text-lg">{task.description}</p>
            )}
          </div>
          <Link href={`/dashboard/tasks/${task.id}/edit`}>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Edit Task
            </button>
          </Link>
        </div>

        {/* Campaign Info */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Campaign</h2>
          <Link href={`/dashboard/campaigns/${task.Campaign.id}`} className="group">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
              <div className="space-y-1">
                <h3 className="font-semibold group-hover:text-primary">{task.Campaign.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(task.Campaign.startDate)} - {formatDate(task.Campaign.endDate)}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                task.Campaign.status === "ACTIVE"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }`}>
                {task.Campaign.status}
              </span>
            </div>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Task Details */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Task Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">XP Reward</span>
                <span className="font-medium">{task.xpReward} XP</span>
              </div>
              {task.rewardAmount && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Token Reward</span>
                  <span className="font-medium">{task.rewardAmount.toString()} {task.rewardToken}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium capitalize">{task.category.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Task Type</span>
                <span className="font-medium capitalize">{task.taskType.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium capitalize">{task.frequency.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Verification</span>
                <span className="font-medium capitalize">{task.verificationMethod}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Total Submissions</span>
                <span className="font-medium">{task._count.TaskSubmissions}</span>
              </div>
            </div>
          </div>

          {/* Top Completers */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Top 3 Early Completers</h2>
            {task.TaskSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No approved submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {task.TaskSubmissions.map((submission, index) => (
                  <div key={submission.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{submission.User.name || submission.User.twitterUsername || submission.User.email}</p>
                      {submission.submittedAt && (
                        <p className="text-sm text-muted-foreground">
                          Completed on {formatDate(submission.submittedAt)}
                        </p>
                      )}
                    </div>
                    {submission.xpAwarded && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-sm font-medium">
                        +{submission.xpAwarded} XP
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sub Tasks */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sub Tasks ({task.SubTasks.length})</h2>
            <button className="text-sm text-primary hover:underline">
              Add Subtask
            </button>
          </div>
          {task.SubTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No subtasks defined yet</p>
              <button className="mt-2 text-sm text-primary hover:underline">
                Create your first subtask
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {task.SubTasks.map((subtask, index) => (
                <div key={subtask.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{subtask.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        subtask.type === "X_TWEET"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      }`}>
                        {subtask.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    {subtask.description && (
                      <p className="text-sm text-muted-foreground">{subtask.description}</p>
                    )}
                    {subtask.link && (
                      <a 
                        href={subtask.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Link</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      {subtask.xpReward > 0 && (
                        <span className="text-muted-foreground">
                          <span className="font-medium text-primary">{subtask.xpReward} XP</span>
                        </span>
                      )}
                      {subtask.isUploadProof && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Proof Required
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        {task.instructions && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-muted-foreground whitespace-pre-wrap">{task.instructions}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
