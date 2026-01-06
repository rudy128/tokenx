'use client'

import React from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import {
  ChevronLeft, Clock, Users, Calendar, CheckCircle, AlertCircle, XCircle, Zap, ArrowRight, Gift, Copy,
  Twitter, MessageSquare, FileText, Upload, ArrowUpRight, Play, Share2, ShieldCheck, Star, X, AlertTriangle, 
  RefreshCw, Mail, ArrowLeft, Search, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TaskSubmissionForm } from '@/components/ui/task-submission-form'
import { TaskTypeBadge } from '@/components/ui/task-type-badge'
import { SubTaskTypeBadge } from '@/components/ui/subtask-type-badge'
import { useToast } from '@/components/ui/use-toast'
import { type TaskType } from '@/lib/task-types'
import { cn } from '@/lib/utils'
import NavBar from '@/components/NavBar'

// Helper function to get platform-specific logo and color
function getPlatformLogo(url: string): { icon: string; color: string } {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    
    // Social Media Platforms
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return {
        icon: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
        color: 'from-blue-400 to-blue-600'
      }
    }
    if (hostname.includes('instagram.com')) {
      return {
        icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
        color: 'from-pink-400 to-purple-600'
      }
    }
    if (hostname.includes('youtube.com')) {
      return {
        icon: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png',
        color: 'from-red-500 to-red-600'
      }
    }
    if (hostname.includes('tiktok.com')) {
      return {
        icon: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
        color: 'from-black to-gray-800'
      }
    }
    if (hostname.includes('linkedin.com')) {
      return {
        icon: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
        color: 'from-blue-600 to-blue-700'
      }
    }
    if (hostname.includes('facebook.com')) {
      return {
        icon: 'https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg',
        color: 'from-blue-500 to-blue-700'
      }
    }
    if (hostname.includes('discord.com')) {
      return {
        icon: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico',
        color: 'from-indigo-500 to-indigo-600'
      }
    }
    if (hostname.includes('telegram.org') || hostname.includes('t.me')) {
      return {
        icon: 'https://telegram.org/img/t_logo.png',
        color: 'from-blue-400 to-blue-500'
      }
    }
    if (hostname.includes('reddit.com')) {
      return {
        icon: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png',
        color: 'from-orange-500 to-orange-600'
      }
    }
    if (hostname.includes('medium.com')) {
      return {
        icon: 'https://miro.medium.com/max/195/1*emiGsBgJu2KHWyjluhKXQw.png',
        color: 'from-gray-800 to-black'
      }
    }
    
    // Default fallback
    return {
      icon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      color: 'from-purple-500 to-purple-600'
    }
  } catch {
    return {
      icon: '',
      color: 'from-gray-700 to-gray-800'
    }
  }
}

async function getTask(id: string) {
  try {
    const response = await fetch(`/api/tasks/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch task')
    }
    
    const task = await response.json()
    
    if (!task) return null

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      image: task.banner ?? undefined,
      platform: task.platform ?? undefined,
      platformLogo: task.platformLogo ?? undefined,
      campaign: task.campaign ?? undefined,
      instructions: task.instructions,
      xp: task.xp,
      frequency: task.frequency,
      status: task.status,
      rewardOverride: task.rewardOverride,
      rewardToken: task.rewardToken,
      rewardAmount: task.rewardAmount,
      perUserCap: task.perUserCap,
      globalCap: task.globalCap,
      availableFrom: task.availableFrom,
      availableTo: task.availableTo,
      submissionCutoff: task.submissionCutoff,
      evidenceMode: task.evidenceMode,
      approvalWorkflow: task.approvalWorkflow,
      verificationMethod: task.verificationMethod,
      verificationMode: task.verificationMode || task.verificationMethod || (task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL'),
      uniqueContent: task.uniqueContent,
      minAccountAgeDays: task.minAccountAgeDays,
      minFollowers: task.minFollowers,
      createdAt: task.createdAt,
      submissions: task.submissions?.length || 0,
      approvedSubmissions: task.submissions?.filter((s: any) => s.status === 'approved').length || 0,
      taskType: task.taskType ?? 'GENERAL',
      steps: task.steps || [],
      referrals: task.referrals || undefined,
      contract: task.contract || undefined,
      contractAddress: task.contractAddress || undefined,
      timer: task.availableTo ? new Date(task.availableTo) : undefined,
      // Use subtasks from database or fallback to default subtasks
      subtasks: task.subTasks && task.subTasks.length > 0
        ? task.subTasks.map((subTask: any) => ({
            id: subTask.id,
            title: subTask.title,
            xp: subTask.xpReward || 0,
            icon: determineTaskIcon(task.platform, subTask.title),
            action: { 
              type: 'link' as const, 
              url: subTask.link || task.actionUrl || task.instructions || '#'
            },
            completed: subTask.isCompleted || false,
            description: subTask.description,
            link: subTask.link || null,
            type: subTask.type || 'X_TWEET'
          }))
        : [
            // Fallback: Generate one fixed subtask if none exist
            {
              id: 'main-action',
              title: task.name,
              xp: task.xp || 50,
              icon: determineTaskIcon(task.platform, task.instructions),
              action: { 
                type: 'link' as const, 
                url: task.actionUrl || task.instructions || '#'
              },
              completed: false
            }
          ] as Subtask[]
    }
  } catch (error) {
    console.error('Error fetching task:', error)
    return null
  }
}

function timeLeft(to: Date | undefined) {
  if (!to) return "--"
  const left = +to - Date.now()
  if (left < 0) return "Ended"
  const d = Math.floor(left / 86400000)
  const h = Math.floor((left / 3600000) % 24)
  const m = Math.floor((left / 60000) % 60)
  return d > 0 ? `${d}d ${h}h`
    : h > 0 ? `${h}h ${m}m`
      : `${m}m`
}

// Get theme color based on task type for variety
const getTaskThemeColor = (task: any, index?: number): string => {
  const colors = [
    'var(--color-primary-500)',    // Social/Primary tasks - Teal
    'var(--color-accent-500)',     // Content tasks - Purple
    'var(--color-success-500)',    // Growth tasks - Green  
    'var(--color-warning-500)'     // Info/Warning tasks - Amber
  ];
  
  // Use task platform or fallback to index cycling
  if (task.platform) {
    const platform = task.platform.toLowerCase();
    if (platform.includes('twitter') || platform.includes('x') || platform.includes('social')) return colors[0]!;
    if (platform.includes('discord') || platform.includes('telegram') || platform.includes('content')) return colors[1]!;
    if (platform.includes('github') || platform.includes('general')) return colors[2]!;
    return colors[3]!;
  }
  
  // Fallback to cycling colors by index
  return colors[(index ?? 0) % colors.length]!;
};

// Sub-task types
type SubtaskAction = {
  type: 'link'
  url?: string
}

type Subtask = {
  id: string
  title: string
  xp: number
  icon: 'twitter' | 'discord' | 'document' | 'video' | 'share' | 'upload'
  action: SubtaskAction
  completed?: boolean
  description?: string
  link?: string | null
  type?: string
}

// Function to determine task icon based on platform and instructions
function determineTaskIcon(platform?: string, instructions?: string): 'twitter' | 'discord' | 'document' | 'video' | 'share' | 'upload' {
  if (!platform && !instructions) return 'document'
  
  const content = `${platform || ''} ${instructions || ''}`.toLowerCase()
  
  if (content.includes('twitter') || content.includes('x.com') || content.includes('tweet')) {
    return 'twitter'
  }
  if (content.includes('discord')) {
    return 'discord'
  }
  if (content.includes('video') || content.includes('youtube') || content.includes('tiktok')) {
    return 'video'
  }
  if (content.includes('share') || content.includes('retweet') || content.includes('post')) {
    return 'share'
  }
  
  return 'document' // Default fallback
}

// Icon mapping function
function getSubtaskIcon(iconType: string, className: string = "") {
  const baseClass = `h-8 w-8 rounded-lg p-1.5 mr-4 ${className}`
  
  switch (iconType) {
    case 'twitter':
      return <Twitter className={`${baseClass} text-[#1DA1F2] bg-[#1DA1F2]/20`} />
    case 'discord':
      return <MessageSquare className={`${baseClass} text-[#5865F2] bg-[#5865F2]/20`} />
    case 'video':
      return <Play className={`${baseClass} text-[#FF6B6B] bg-[#FF6B6B]/20`} />
    case 'share':
      return <Share2 className={`${baseClass} text-[#8c6cfb] bg-[#8c6cfb]/20`} />
    case 'upload':
      return <Upload className={`${baseClass} text-[#82EC40] bg-[#82EC40]/20`} />
    case 'document':
    default:
      return <FileText className={`${baseClass} text-[#8c6cfb] bg-[#222040]`} />
  }
}

// TaskSubtasks Component
function TaskSubtasks({ 
  subtasks, 
  loading = false,
  onToggleComplete
}: { 
  subtasks: Subtask[]
  loading?: boolean
  onToggleComplete?: (subtaskId: string, currentStatus: boolean) => void
}) {
  const handleSubtaskClick = (subtask: Subtask) => {
    if (subtask.action.type === 'link' && subtask.action.url) {
      window.open(subtask.action.url, '_blank', 'noopener,noreferrer')
    }
  }

  // Handle submit button click
  const handleSubmit = (e: React.MouseEvent, subtaskId: string) => {
    e.stopPropagation()
    if (onToggleComplete) {
      // Always set to true (submitted)
      onToggleComplete(subtaskId, false) // passing currentStatus as false so it toggles to true
    }
  }

  if (loading) {
    return (
      <div className="subtasks-container">
        <h2 className="text-xl font-bold text-white mb-6">Sub-tasks</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-linear-to-br from-[#191B24] to-[#181B28] border border-[#23263B] shadow-xl rounded-xl p-6">
            <div className="flex items-center gap-4">
              {/* Platform Logo Skeleton */}
              <div className="w-12 h-12 bg-zinc-700/50 rounded-xl shrink-0" />
              
              {/* Title Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="h-5 bg-zinc-700/50 rounded-lg w-2/3" />
              </div>
              
              {/* XP Badge Skeleton */}
              <div className="h-7 w-16 bg-zinc-700/50 rounded-full shrink-0" />
              
              {/* Action Button Skeleton */}
              <div className="w-8 h-8 bg-zinc-700/50 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!subtasks || subtasks.length === 0) return null

  return (
    <div className="subtasks-container">
      <h2 className="text-xl font-bold text-white mb-6">Sub-tasks</h2>
      {subtasks.map((subtask, index) => (
        <div
          key={subtask.id}
          data-subtask-id={subtask.id}
          className={cn(
            "bg-linear-to-br from-[#191B24] to-[#181B28] border border-[#23263B] shadow-xl rounded-xl p-6",
            "transition-all duration-200 hover:scale-[1.02] hover:ring-2 hover:ring-[#8c6cfb]/40 hover:shadow-2xl",
            "group relative overflow-hidden",
            subtask.completed && "opacity-90 bg-linear-to-br from-[#1a2e1a]/30 to-[#162416]/30 border-blue-500/30"
          )}
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-linear-to-r from-[#8c6cfb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <div className="flex items-start gap-4 relative z-10">
            {/* Platform Logo/Favicon */}
            <div className="shrink-0">
              {subtask.link ? (
                (() => {
                  {/* Note: The color variable comes from getPlatformLogo which returns 'from-X to-Y' strings. 
                      Since those are likely legacy gradient classes, we might need to update that helper too if strict. 
                      However for now we fix the visible lint errors in THIS file. */}
                  const { icon, color } = getPlatformLogo(subtask.link)
                  // Replace legacy gradient syntax in the color string if possible, or just use it ensuring it renders
                  // But the container below uses `bg-linear-to-br`
                  return (
                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${color} border border-gray-700 flex items-center justify-center overflow-hidden p-1.5`}>
                      {icon ? (
                        <img
                          src={icon}
                          alt={`${subtask.title} platform`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              `
                            }
                          }}
                        />
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      )}
                    </div>
                  )
                })()
              ) : (
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content - Title and Type Badge */}
            <div 
              className="flex-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-semibold text-base md:text-lg transition-colors",
                      subtask.completed ? "text-gray-300" : "text-white"
                    )}>
                      {subtask.title}
                    </h3>
                  </div>
                  {subtask.type && (
                    <div className="mt-1">
                      <SubTaskTypeBadge type={subtask.type} />
                    </div>
                  )}
                  {subtask.completed && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400">Under Review</span>
                    </div>
                  )}
                </div>

                {/* Right side: XP Badge + Action + Submit Button */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Top row: XP Badge + Link Icon */}
                  <div className="flex items-center gap-3">
                    <Badge className="inline-flex items-center justify-center rounded-full bg-[#222950] text-[#82EC40] font-bold px-4 py-1.5 text-sm shadow-lg border border-[#82EC40]/20 whitespace-nowrap min-w-17.5">
                      {subtask.xp} XP
                    </Badge>

                    {subtask.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (subtask.link) {
                            window.open(subtask.link, '_blank', 'noopener,noreferrer')
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-[#8c6cfb]/20 hover:bg-[#8c6cfb]/30 cursor-pointer`}
                        title="Open link"
                      >
                        <ArrowUpRight className="h-4 w-4 text-[#8c6cfb]" />
                      </button>
                    )}
                  </div>

                  {/* Bottom row: Submit Button */}
                  <div className="flex items-center gap-3">
                    {!subtask.completed ? (
                      <button
                        onClick={(e) => handleSubmit(e, subtask.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#8c6cfb] hover:bg-[#7c5cfb] text-white transition-all duration-200 text-xs font-bold shadow-lg shadow-[#8c6cfb]/20"
                        style={{ padding: '8px 24px', minWidth: 'fit-content' }}
                      >
                        <span>Submit</span>
                      </button>
                    ) : (
                       <button
                        disabled
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed text-xs font-medium"
                        style={{ padding: '8px 16px', minWidth: 'fit-content' }}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Submitted</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion indicator */}
          {subtask.completed && (
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-xl" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CampaignTaskDetailPage() {
  const params = useParams()
  const [task, setTask] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const { toast } = useToast()
  
  // Get taskId and campaignId from params - note: campaign route uses 'taskId' param name
  const taskId = params.taskId as string
  const campaignId = params.id as string
  
  React.useEffect(() => {
    async function fetchTask() {
      if (!taskId) return
      
      try {
        setLoading(true)
        setError(null)
        const taskData = await getTask(taskId)
        if (!taskData) {
          setError('Task not found')
          return
        }
        setTask(taskData)
      } catch (error) {
        console.error('Error loading task:', error)
        setError('Failed to load task. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTask()
  }, [taskId])

  // Keyboard event handling for accessibility
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus management for error/loading states
  React.useEffect(() => {
    if (error) {
      // Focus the retry button when error state appears
      const retryButton = document.querySelector('[aria-label="Retry loading task"]') as HTMLElement
      retryButton?.focus()
    }
  }, [error])

  // Announce status changes to screen readers
  React.useEffect(() => {
    if (feedbackMessage) {
      // Create a temporary element for screen reader announcements
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = feedbackMessage.message
      document.body.appendChild(announcement)
      
      // Clean up after announcement
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }
  }, [feedbackMessage])

  // Close handler with focus restoration
  const handleClose = () => {
    // Could navigate back or close modal depending on context
    window.history.back()
  }

  // Show feedback message
  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedbackMessage({ type, message })
    setTimeout(() => setFeedbackMessage(null), 5000) // Auto-hide after 5 seconds
  }

  // Retry function for error recovery
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Re-trigger the fetch by calling the effect logic directly
    async function retryFetch() {
      try {
        const taskData = await getTask(taskId)
        if (!taskData) {
          setError('Task not found')
          return
        }
        setTask(taskData)
      } catch (error) {
        console.error('Error loading task:', error)
        setError('Failed to load task. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    retryFetch()
  }

  // Handle subtask completion with animations and API update
  const handleSubtaskComplete = async (subtaskId: string, currentStatus: boolean) => {
    // If already completed, don't toggle back
    if (currentStatus) return;

    try {
      // Optimistically update UI
      setTask((prevTask: any) => {
        if (!prevTask) return prevTask
        return {
          ...prevTask,
          subtasks: prevTask.subtasks.map((st: any) =>
            st.id === subtaskId ? { ...st, completed: true } : st
          )
        }
      })

      // Update in database
      const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCompleted: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update subtask')
      }

      // Animate and show feedback
      showFeedback('success', 'Sub-task submitted for review!')
    } catch (error) {
      console.error('Failed to update subtask:', error)
      // Revert optimistic update
      setTask((prevTask: any) => {
        if (!prevTask) return prevTask
        return {
          ...prevTask,
          subtasks: prevTask.subtasks.map((st: any) =>
            st.id === subtaskId ? { ...st, completed: false } : st
          )
        }
      })
      showFeedback('error', 'Failed to submit sub-task. Please try again.')
    }
  }

  // Skeleton loading state
  if (loading) {
    return (
      <div className="min-h-screen task-details-page" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        
        <main className="task-page-main">
          <div className="task-content-grid" role="status" aria-live="polite" aria-label="Loading task details">
            
            {/* Header Skeleton - Left */}
            <section className="task-header-left">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </section>

            {/* Banner Skeleton - Right */}
            <aside className="banner-right">
              <div className="skeleton-banner"></div>
            </aside>

            {/* Status Strip Skeleton */}
            <div className="status-strip-row">
              <div className="skeleton-status-chip"></div>
              <div className="skeleton-status-info"></div>
              <div className="skeleton-avatars"></div>
            </div>

            {/* Sub-tasks Skeleton */}
            <section className="tasks-section">
              <div className="skeleton-section-header"></div>
              <div className="skeleton-section-subtitle"></div>
              
              <div className="subtasks-list">
                <div className="skeleton-subtask-card"></div>
                <div className="skeleton-subtask-card"></div>
              </div>
            </section>

            {/* Claim Block Skeleton */}
            <div className="claim-block-section">
              <div className="skeleton-claim-card"></div>
            </div>

          </div>
        </main>
      </div>
    )
  }
  
  // Error state handling
  if (error) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        <div className="task-page-wrapper">
          <div className="task-error-container" role="alert" aria-live="assertive">
            <AlertTriangle className="error-icon" />
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <Button 
                onClick={handleRetry}
                className="btn-primary"
                aria-label="Retry loading task"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = 'mailto:support@ambassadorx.com?subject=Task Loading Issue'}
                variant="outline"
                aria-label="Contact support for help"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state (task not found)
  if (!task) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        <div className="task-page-wrapper">
          <div className="task-empty-container" role="status" aria-live="polite">
            <Search className="empty-icon" />
            <h2 className="empty-title">Task Not Found</h2>
            <p className="empty-message">
              The task you're looking for doesn't exist or may have been removed.
            </p>
            <Link href={campaignId ? `/dashboard/campaigns/${campaignId}` : "/dashboard/campaigns"}>
              <Button className="btn-primary" aria-label="Return to campaign">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const mockUser = { id: 'demo-user-1' }
  const completionRate = task.submissions > 0 ? Math.round((task.approvedSubmissions / task.submissions) * 100) : 0
  const globalProgress = task.globalCap ? (task.submissions / task.globalCap) * 100 : 0
  
  // Calculate if all subtasks are completed (under review)
  const allSubtasksCompleted = task.subtasks && task.subtasks.length > 0 && task.subtasks.every((st: any) => st.completed);

  return (
    <div className="min-h-screen task-details-page" style={{ background: 'var(--bg-primary)' }}>
      <NavBar />
      
      {/* Main Content Layout */}
      <main className="task-page-main">
        <div className="task-content-grid">
          
          {/* Header Section - Left */}
          <section className="task-header-left">
            <h1 className="project-title">{task.name}</h1>
            <h4 className="project-subtitle">{task.description || "Complete tasks to earn rewards"}</h4>
          </section>

          {/* Banner Image - Right */}
          <aside className="banner-right">
            <div className="banner-image-container">
              <div className="banner-colorful-grid" aria-hidden="true"></div>
              <div className="banner-title-overlay">
                <h2 className="banner-title">{task.name}</h2>
              </div>
            </div>
          </aside>

          {/* Status Strip Row */}
          <div className="status-strip-row">
            {allSubtasksCompleted ? (
              <div className="status-chip bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Under Review
              </div>
            ) : (
              <div className="status-chip ongoing">
                <span className="status-dot"></span>
                Ongoing
              </div>
            )}
            
            <div className="status-info">
              {task.timer && (
                <span className="status-time">
                  <Clock className="status-icon" />
                  Ends in {timeLeft(task.timer)}
                </span>
              )}
            </div>
            
            <div className="status-avatars">
              <div className="avatar-group">
                <div className="avatar avatar-1"></div>
                <div className="avatar avatar-2"></div>
                <div className="avatar avatar-3"></div>
                <div className="avatar-count">+{task.submissions || 0}</div>
              </div>
            </div>
          </div>

          {/* Sub-tasks Section */}
          <section className="tasks-section">
            <TaskSubtasks 
              subtasks={task.subtasks || []} 
              loading={loading}
              onToggleComplete={handleSubtaskComplete}
            />
          </section>

        </div>

        {/* Feedback Messages */}
        {feedbackMessage && (
          <div className={`feedback-chip feedback-chip-${feedbackMessage.type}`}>
            {feedbackMessage.type === 'success' && <CheckCircle className="h-4 w-4" />}
            {feedbackMessage.type === 'error' && <AlertCircle className="h-4 w-4" />}
            {feedbackMessage.type === 'info' && <Star className="h-4 w-4" />}
            <span>{feedbackMessage.message}</span>
          </div>
        )}


      </main>
    </div>
  )
}
