'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SubmissionActionProps {
  submissionId: string
  action: 'approve' | 'reject'
}

export function SubmissionAction({ submissionId, action }: SubmissionActionProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/org/submissions/${submissionId}/${action}`, {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (err) {
      console.error(`Error ${action}ing submission:`, err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className={`text-sm px-3 py-1 rounded hover:opacity-90 disabled:opacity-50 ${
        action === 'approve'
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-red-600 text-white hover:bg-red-700'
      }`}
    >
      {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
    </button>
  )
}
