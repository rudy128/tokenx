"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, CheckCircle, XCircle, Clock, User, Calendar, FileText, Eye } from "lucide-react"
import AdminLayout from "../admin-layout"
import type { Prisma } from "@prisma/client"

interface TaskWithSubmissions {
  id: string
  campaignId: string
  name: string
  description: string
  category: string
  xpReward: number
  verificationMethod: string
  requirements?: Prisma.JsonValue
  status: string
  createdAt: Date
  updatedAt: Date
  Campaign: {
    id: string
    name: string
    status: string
  }
  TaskSubmission?: Array<{
    id: string
    status: string
    submittedAt: Date
    verifiedAt?: Date | null
    description?: string | null
    proofUrl?: string | null
    proofImageUrl?: string | null
    reviewNotes?: string | null
    User: {
      id: string
      name: string | null
      email: string
      image?: string | null
    }
  }>
}

interface TaskDetailViewProps {
  task: TaskWithSubmissions
}

export default function TaskDetailView({ task }: TaskDetailViewProps) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isOverridingAI, setIsOverridingAI] = useState(false)

  const handleDisableAI = async () => {
    if (!confirm('Are you sure you want to disable AI verification for this task? This will switch it to MANUAL verification.')) return

    setIsOverridingAI(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}/disable-ai`, {
        method: 'POST',
      })

      if (response.ok) {
        alert('AI verification disabled. Task is now set to MANUAL verification.')
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(`Failed to disable AI: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error disabling AI:', error)
      alert('Failed to disable AI verification.')
    } finally {
      setIsOverridingAI(false)
    }
  }

  const handleApprove = async (submissionId: string) => {
    if (!confirm('Are you sure you want to approve this submission?')) return

    console.log('🎯 Approving submission:', submissionId)
    setProcessingId(submissionId)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/approve`, {
        method: 'POST',
      })

      console.log('📡 Approve response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Approve successful:', data)
        alert('Submission approved successfully!')
        router.refresh()
      } else {
        const errorData = await response.json()
        console.error('❌ Approve failed:', errorData)
        alert(`Failed to approve submission: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error approving submission:', error)
      alert('Failed to approve submission. Check console for details.')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (submissionId: string) => {
    const reason = prompt('Enter rejection reason (optional):')
    if (reason === null) return // User cancelled

    console.log('🎯 Rejecting submission:', submissionId, 'Reason:', reason)
    setProcessingId(submissionId)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      console.log('📡 Reject response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Reject successful:', data)
        alert('Submission rejected successfully!')
        router.refresh()
      } else {
        const errorData = await response.json()
        console.error('❌ Reject failed:', errorData)
        alert(`Failed to reject submission: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error rejecting submission:', error)
      alert('Failed to reject submission. Check console for details.')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      APPROVED: 'bg-green-100 text-green-700 border-green-300',
      REJECTED: 'bg-red-100 text-red-700 border-red-300',
      NEEDS_CLARIFICATION: 'bg-blue-100 text-blue-700 border-blue-300',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.PENDING}`}>
        {status}
      </span>
    )
  }

  const submissions = task.TaskSubmission || []
  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING')
  const approvedSubmissions = submissions.filter(s => s.status === 'APPROVED')
  const rejectedSubmissions = submissions.filter(s => s.status === 'REJECTED')

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/tasks" className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft size={16} />
              Back to Tasks
            </Link>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {task.name}
                </h1>
                <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {task.description}
                </p>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  <span>Campaign: {task.Campaign.name}</span>
                  <span>•</span>
                  <span>XP Reward: {task.xpReward}</span>
                  <span>•</span>
                  <span>Verification: {task.verificationMethod}</span>
                </div>
              </div>
              <Link href={`/tasks/${task.id}/edit`} className="btn btn-secondary flex items-center gap-2">
                <Edit size={18} />
                Edit Task
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--status-warning-bg)' }}>
                  <Clock size={20} style={{ color: 'var(--status-warning)' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{pendingSubmissions.length}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending</div>
                </div>
              </div>
            </div>

            <div className="card p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--status-success-bg)' }}>
                  <CheckCircle size={20} style={{ color: 'var(--status-success)' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{approvedSubmissions.length}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Approved</div>
                </div>
              </div>
            </div>

            <div className="card p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--status-error-bg)' }}>
                  <XCircle size={20} style={{ color: 'var(--status-error)' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{rejectedSubmissions.length}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rejected</div>
                </div>
              </div>
            </div>

            <div className="card p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <FileText size={20} style={{ color: 'var(--interactive-primary)' }} />
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{submissions.length}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Override Alert */}
          {(task.verificationMethod === 'AI_AUTO' || task.verificationMethod === 'HYBRID') && (
            <div className="card p-4 mb-6" style={{ backgroundColor: 'var(--status-warning-bg)', border: '1px solid var(--status-warning)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--status-warning)' }}>
                    AI Verification Active
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    This task uses {task.verificationMethod === 'AI_AUTO' ? 'AI Automatic' : 'Hybrid (AI + Manual)'} verification. 
                    In case of AI failure, you can disable AI and manually review all submissions.
                  </p>
                </div>
                <button
                  onClick={handleDisableAI}
                  disabled={isOverridingAI}
                  className="btn btn-sm btn-warning flex items-center gap-2 whitespace-nowrap"
                >
                  <XCircle size={16} />
                  {isOverridingAI ? 'Disabling...' : 'Disable AI'}
                </button>
              </div>
            </div>
          )}

          {/* Submissions List */}
          <div className="card" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Submissions
                </h2>
                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                  Verification: {task.verificationMethod}
                </span>
              </div>
            </div>

            <div className="p-6">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-default)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--interactive-primary)' }}>
                            {submission.User.image ? (
                              <Image src={submission.User.image} alt={submission.User.name || 'User'} width={40} height={40} className="rounded-full" />
                            ) : (
                              <User size={20} style={{ color: 'var(--text-inverse)' }} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {submission.User.name || 'Anonymous'}
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                              {submission.User.email}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>

                      {submission.description && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description:</div>
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{submission.description}</div>
                        </div>
                      )}

                      {submission.proofUrl && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Proof URL:</div>
                          <a
                            href={submission.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1 hover:underline"
                            style={{ color: 'var(--interactive-primary)' }}
                          >
                            {submission.proofUrl}
                            <Eye size={14} />
                          </a>
                        </div>
                      )}

                      {submission.proofImageUrl && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Proof Image:</div>
                          <Image
                            src={submission.proofImageUrl}
                            alt="Proof"
                            width={600}
                            height={400}
                            className="max-w-md rounded border"
                            style={{ borderColor: 'var(--border-default)' }}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
                        <Calendar size={12} />
                        <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                      </div>

                      {submission.reviewNotes && (
                        <div className="mb-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-surface)' }}>
                          <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Review Notes:</div>
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{submission.reviewNotes}</div>
                        </div>
                      )}

                      {submission.status === 'PENDING' && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleApprove(submission.id)}
                            disabled={processingId === submission.id}
                            className="btn btn-sm btn-success flex items-center gap-2"
                          >
                            <CheckCircle size={14} />
                            {processingId === submission.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(submission.id)}
                            disabled={processingId === submission.id}
                            className="btn btn-sm btn-danger flex items-center gap-2"
                          >
                            <XCircle size={14} />
                            {processingId === submission.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
