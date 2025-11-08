'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react'
import TaskDetailView from '@/components/tasks/task-detail-original'
import NavBar from '@/components/NavBar'

async function getCampaignTask(campaignId: string, taskId: string) {
  try {
    // Fetch task with real subtasks from the API
    const response = await fetch(`/api/tasks/${taskId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch campaign task')
    }
    
    const task = await response.json()
    
    if (!task) return null

    console.log('📥 Fetched task with subtasks:', task.subTasks?.length || 0)

    // Transform for the new component format
    return {
      id: task.id,
      title: task.name,
      description: task.description || '',
      xpReward: task.xp || task.xpReward || 0,
      status: task.status || 'ACTIVE',
      campaign: {
        id: campaignId,
        name: task.campaign?.name || '',
        slug: task.campaign?.slug || '',
        status: task.campaign?.status || 'ACTIVE'
      },
      subTasks: (task.subTasks || []).map((st: any) => ({
        id: st.id,
        title: st.title,
        description: st.description || null,
        link: st.link || null,
        xpReward: st.xpReward || 0,
        order: st.order || 0,
        isCompleted: st.isCompleted || false
      })),
      _count: {
        submissions: task.submissions?.length || 0
      }
    }
  } catch (error) {
    console.error('Error fetching campaign task:', error)
    return null
  }
}

export default function CampaignTaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [task, setTask] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [userId, setUserId] = React.useState<string>('')
  
  const campaignId = params.id as string
  const taskId = params.taskId as string
  
  React.useEffect(() => {
    async function fetchTask() {
      if (!campaignId || !taskId) {
        console.error('❌ Missing campaignId or taskId')
        return
      }
      
      console.log('🔍 Fetching task:', taskId, 'for campaign:', campaignId)
      
      try {
        setLoading(true)
        setError(null)
        const taskData = await getCampaignTask(campaignId, taskId)
        console.log('📦 Task data received:', taskData)
        console.log('📦 Subtasks count:', taskData?.subTasks?.length || 0)
        
        if (!taskData) {
          console.error('❌ No task data returned')
          setError('Campaign task not found')
          return
        }
        setTask(taskData)
        console.log('✅ Task state updated successfully')
      } catch (error) {
        console.error('❌ Error loading campaign task:', error)
        setError('Failed to load campaign task. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTask()
  }, [campaignId, taskId])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading task...</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md px-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Task Not Found</h2>
            <p className="text-gray-400 mb-6">
              {error || 'The task you\'re looking for doesn\'t exist or may have been removed.'}
            </p>
            <button
              onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Campaign
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <NavBar />
      <TaskDetailView task={task} userId={userId} />
    </div>
  )
}
