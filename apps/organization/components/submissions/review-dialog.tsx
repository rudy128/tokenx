"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"

interface SubmissionProps {
    id: string
    taskId: string
    subTaskId: string | null
    userId: string
    status: string
    submittedAt: Date | null
    proofUrl?: string | null
    proofImageUrl?: string | null
    description?: string | null
    Task: {
        id: string
        name: string
        taskType: string
        xpReward: number
        campaignId: string
        Campaign?: {
            id: string
            name: string
            description: string | null
            status: string
        }
        SubTasks?: Array<{
            id: string
            title: string
            xpReward: number
            type: string
        }>
    }
    User: {
        id: string
        name: string | null
        email: string
        image: string | null
        twitterUsername: string | null
        xp: number
        createdAt: Date
    }
}

export function ReviewDialog({ submission }: { submission: SubmissionProps }) {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)

    if (!submission) return null

    // Safe accessors with fallbacks
    const xp = submission.User?.xp || 0
    const level = Math.floor(xp / 100) + 1
    const joinDate = submission.User?.createdAt 
        ? new Date(submission.User.createdAt).toLocaleDateString() 
        : 'Unknown'
    
    // Find the specific subtask if this is a subtask submission
    const currentSubTask = submission.subTaskId 
        ? submission.Task.SubTasks?.find(st => st.id === submission.subTaskId)
        : null

    const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
        try {
            setLoading(true)
            const response = await fetch(`/api/submissions/${submission.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to process action')
            }

            // Close dialog and refresh the page
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Action error:', error)
            alert(error instanceof Error ? error.message : 'Failed to process action')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Review
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] flex gap-0 p-0 overflow-hidden">
                {/* Left Side: Submission Details */}
                <div className="flex-1 flex flex-col h-full border-r">
                    <DialogHeader className="p-6 border-b">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-xl mb-1">{submission.Task.name}</DialogTitle>
                                {submission.Task.Campaign && (
                                    <DialogDescription className="text-sm">
                                        Campaign: {submission.Task.Campaign.name}
                                    </DialogDescription>
                                )}
                            </div>
                            <Badge variant="secondary" className="ml-4 text-base px-3 py-1">
                                {submission.Task.xpReward} XP
                            </Badge>
                        </div>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-6">
                            {/* SubTask Info - Only show if this is a subtask submission */}
                            {currentSubTask && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Sub-Task Details</h3>
                                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="font-semibold">{currentSubTask.title}</div>
                                            <Badge variant="secondary">{currentSubTask.xpReward} XP</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Type: {currentSubTask.type}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Submission Content */}
                             <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Submission Evidence</h3>
                                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                    {submission.proofUrl && (
                                         <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Proof URL:</span>
                                            <a href={submission.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                                                {submission.proofUrl}
                                            </a>
                                         </div>
                                    )}
                                    {submission.proofImageUrl && (
                                         <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Proof Image:</span>
                                            <div className="relative h-48 w-full rounded overflow-hidden border">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={submission.proofImageUrl} alt="Proof" className="object-contain w-full h-full bg-black/5" />
                                            </div>
                                         </div>
                                    )}
                                    {submission.description && (
                                         <div>
                                            <span className="text-sm text-muted-foreground block mb-1">Description:</span>
                                            <p className="text-sm whitespace-pre-wrap">{submission.description}</p>
                                         </div>
                                    )}
                                    
                                    {!submission.proofUrl && !submission.proofImageUrl && !submission.description && (
                                        <span className="text-sm text-muted-foreground italic">No evidence details provided.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    
                    <div className="p-6 border-t bg-muted/20">
                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => handleAction('REJECTED')}
                                disabled={loading || submission.status !== 'PENDING'}
                            >
                                {loading ? 'Processing...' : 'Reject'}
                            </Button>
                            <Button 
                                onClick={() => handleAction('APPROVED')}
                                disabled={loading || submission.status !== 'PENDING'}
                            >
                                {loading ? 'Processing...' : 'Approve'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: User Profile */}
                <div className="w-80 bg-muted/10 h-full flex flex-col">
                     <div className="p-6 border-b">
                        <h3 className="font-semibold">User Profile</h3>
                     </div>
                     <ScrollArea className="flex-1 p-6">
                        <div className="flex flex-col items-center text-center space-y-3 mb-8">
                             <div className="h-20 w-20 rounded-full bg-slate-200 overflow-hidden ring-4 ring-background shadow-sm">
                                {submission.User.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={submission.User.image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400 text-2xl font-bold">
                                        {submission.User.name?.substring(0, 2).toUpperCase() || 'U'}
                                    </div>
                                )}
                             </div>
                             <div>
                                 <div className="font-bold text-lg">{submission.User.name}</div>
                                 <div className="text-sm text-muted-foreground">{submission.User.email}</div>
                             </div>
                             
                             <div className="flex gap-2">
                                 <Badge variant="secondary">Lvl {level}</Badge>
                                 <Badge variant="secondary">{xp} XP</Badge>
                             </div>
                        </div>
                        
                        <div className="space-y-4">
                            <Separator />
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">Socials</h4>
                                <div className="text-sm">
                                     <div className="flex justify-between py-1">
                                         <span>Twitter</span>
                                         <span className="font-mono text-muted-foreground">
                                            {submission.User.twitterUsername ? `@${submission.User.twitterUsername}` : 'N/A'}
                                         </span>
                                     </div>
                                </div>
                            </div>
                            
                             <Separator />
                            <div>
                                <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-2">History</h4>
                                <div className="text-sm">
                                     <div className="flex justify-between py-1">
                                         <span>Joined</span>
                                         <span className="text-muted-foreground">{joinDate}</span>
                                     </div>
                                </div>
                            </div>
                        </div>
                     </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
