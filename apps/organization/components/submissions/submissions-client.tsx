"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  submissions: any[]; // Using any for now to match the complex prisma return type quickly, ideally should be defined type
}

export function SubmissionsClient({ submissions }: Props) {
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const getStatusCount = (status: string) => 
    submissions.filter(s => s.status === status).length;

  return (
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
                         <Button 
                           variant="outline"
                           size="sm"
                           onClick={() => setSelectedSubmission(item)}
                         >
                           Review
                         </Button>
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

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          <div className="flex h-full max-h-[90vh]">
            {/* Left Panel: Submission Details */}
            <div className="flex-1 p-6 border-r overflow-y-auto">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl">Submission Review</DialogTitle>
                <DialogDescription>
                   Review the details of this specific submission.
                </DialogDescription>
              </DialogHeader>

              {selectedSubmission && (
                <div className="space-y-6">
                  {/* Task Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Task Details</h3>
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                       <div>
                         <span className="text-xs text-muted-foreground">Task Name</span>
                         <p className="font-medium">{selectedSubmission.Task.name}</p>
                       </div>
                       <div>
                         <span className="text-xs text-muted-foreground">Type</span>
                         <p className="font-medium capitalize">{selectedSubmission.Task.taskType?.toLowerCase().replace('_', ' ') || 'General'}</p>
                       </div>
                       <div>
                         <span className="text-xs text-muted-foreground">Submitted At</span>
                         <p className="font-medium">
                            {new Date(selectedSubmission.submittedAt).toLocaleString()}
                         </p>
                       </div>
                    </div>
                  </div>
                  
                  {/* Submission Evidence */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Evidence</h3>
                    <div className="rounded-lg border bg-background p-4 min-h-25 flex items-center justify-center text-muted-foreground text-sm italic">
                       {/* This would be populated with actual evidence like screenshots/links if we had them in the include query or mocked data */}
                       No evidence text or files attached (Mock Data Only)
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                     <Button className="flex-1 bg-green-600 hover:bg-green-700">Approve Submission</Button>
                     <Button variant="destructive" className="flex-1">Reject</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: User Profile */}
            <div className="w-75 bg-muted/20 p-6 space-y-6">
              {selectedSubmission && (
                <>
                   <div className="flex flex-col items-center text-center space-y-3">
                      <div className="h-24 w-24 rounded-full bg-slate-200 overflow-hidden border-4 border-background shadow-sm">
                         {selectedSubmission.User.image ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={selectedSubmission.User.image} alt={selectedSubmission.User.name} className="h-full w-full object-cover" />
                         ) : (
                             <div className="h-full w-full flex items-center justify-center bg-slate-700 text-white text-3xl font-bold">
                                 {selectedSubmission.User.name?.charAt(0) || 'U'}
                             </div>
                         )}
                      </div>
                      <div>
                         <h2 className="font-bold text-lg">{selectedSubmission.User.name}</h2>
                         <p className="text-sm text-muted-foreground">{selectedSubmission.User.email}</p>
                      </div>
                   </div>

                   <Separator />

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">Level</span>
                         <span className="font-bold">5</span> {/* Mock Level - Need to calc from XP */}
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">XP</span>
                         <span className="font-bold text-blue-600">1,250 XP</span> {/* Mock XP */}
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-muted-foreground">Joined</span>
                         <span className="text-sm font-medium">Jan 2024</span>
                      </div>
                   </div>

                   <Separator />

                   {selectedSubmission.User.twitterUsername && (
                     <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 flex items-center gap-3">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span className="text-sm font-medium text-blue-600">@{selectedSubmission.User.twitterUsername ?? 'none'}</span>
                     </div>
                   )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
