import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/session";
import { DashboardLayout } from "@/components/dashboard-layout";
import { prisma } from "@repo/prisma";

export default async function SubmissionsPage() {
  const session = await getOrganizationSession();
  
  if (!session) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

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
            <button className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors">
              Export
            </button>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No submissions yet</p>
            </div>
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
                className="h-4 w-4 text-yellow-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </div>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Accepted submissions</p>
            </div>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Declined submissions</p>
            </div>
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

        {/* Empty State */}
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No submissions yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Submissions from ambassadors will appear here once they start completing tasks. 
            You can review, approve, or reject each submission.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Create Task
            </button>
            <button className="px-6 py-2 border border-input rounded-lg hover:bg-accent transition-colors">
              Invite Ambassadors
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">About Submissions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 h-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Review Process</h4>
                <p className="text-sm text-muted-foreground">
                  Review each submission carefully. You can approve, reject, or request changes from ambassadors.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 h-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Approval Workflow</h4>
                <p className="text-sm text-muted-foreground">
                  Approved submissions automatically update task progress and reward ambassadors based on your campaign settings.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-2 h-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Response Time</h4>
                <p className="text-sm text-muted-foreground">
                  Aim to review submissions within 24-48 hours to keep ambassadors engaged and motivated.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-2 h-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium mb-1">Feedback & Communication</h4>
                <p className="text-sm text-muted-foreground">
                  Provide clear feedback when rejecting submissions to help ambassadors improve their future work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
