'use client'

import React from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import {
  ChevronLeft, Clock, Users, Calendar, CheckCircle, AlertCircle, XCircle, Zap, ArrowRight, Gift, ExternalLink, Copy,
  Twitter, MessageSquare, FileText, Upload, ArrowUpRight, Play, Share2, ShieldCheck, Star, X, AlertTriangle, 
  RefreshCw, Mail, ArrowLeft, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TaskSubmissionForm } from '@/components/ui/task-submission-form'
import { TaskTypeBadge } from '@/components/ui/task-type-badge'
import { useToast } from '@/components/ui/use-toast'
import { type TaskType } from '@/lib/task-types'
import { cn } from '@/lib/utils'
import NavBar from '@/components/NavBar'

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
      verificationMode: task.verificationMode || (task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL'),
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
      // Generate two fixed subtasks for every daily task
      subtasks: [
        // 1. Main Title Task - Action card that redirects to the given link
        {
          id: 'main-action',
          title: task.name, // Use the main task title
          xp: Math.floor((task.xp || 50) * 0.7), // 70% of main task XP for action
          icon: determineTaskIcon(task.platform, task.instructions), // Determine icon based on platform/content
          action: { 
            type: 'link' as const, 
            url: task.actionUrl || task.instructions || '#' // Use actionUrl or fallback to instructions or placeholder
          },
          completed: false
        },
        // 2. Upload Task - Always present for media/file submission
        {
          id: 'upload-proof',
          title: 'Upload proof/media for this task',
          xp: Math.floor((task.xp || 50) * 0.3), // 30% of main task XP for upload
          icon: 'upload' as const,
          action: { 
            type: 'upload' as const, 
            uploadHandler: () => {
              // Handle file upload
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*,video/*,.pdf,.doc,.docx'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  console.log('File selected for upload:', file.name)
                  // TODO: Implement actual file upload logic here
                  // You can integrate with your existing upload system
                }
              }
              input.click()
            }
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
  type: 'link' | 'upload'
  url?: string
  uploadHandler?: () => void
}

type Subtask = {
  id: string
  title: string
  xp: number
  icon: 'twitter' | 'discord' | 'document' | 'video' | 'share' | 'upload'
  action: SubtaskAction
  completed?: boolean
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

// Premium Claim Status Modal Component
function ClaimStatusModal({ 
  open, 
  mode, 
  xpAmount, 
  rewardToken, 
  rewardAmount, 
  onClose 
}: { 
  open: boolean
  mode: 'AUTO' | 'MANUAL'
  xpAmount?: number
  rewardToken?: string
  rewardAmount?: string
  onClose: () => void 
}) {
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Auto-close after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [open, onClose])

  // Handle keyboard events for accessibility
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="claim-modal-backdrop" 
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />
      
      {/* Perfectly centered modal container */}
      <div className="claim-modal-container">
        <div 
          className="claim-modal-content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
        >
          {mode === 'AUTO' ? (
            <>
              <div className="claim-modal-icon claim-modal-icon-success">
                <CheckCircle className="text-green-400 h-8 w-8" />
              </div>
              <div id="claim-modal-title" className="claim-modal-title">Claimed Successfully!</div>
              <div className="claim-modal-description">
                Your {xpAmount} XP{rewardToken && rewardAmount ? ` and ${rewardAmount} ${rewardToken}` : ''} have been credited.
              </div>
              <div className="claim-modal-badge claim-modal-badge-success">
                <Star className="text-green-400 h-4 w-4" />
                <span className="text-sm font-semibold text-green-400">Reward Added</span>
              </div>
            </>
          ) : (
            <>
              <div className="claim-modal-icon claim-modal-icon-pending">
                <ShieldCheck className="text-blue-400 h-8 w-8" />
              </div>
              <div id="claim-modal-title" className="claim-modal-title">Review Pending</div>
              <div className="claim-modal-description">
                Reward will be credited after review.
              </div>
              <div className="claim-modal-badge claim-modal-badge-pending">
                <Clock className="text-blue-400 h-4 w-4" />
                <span className="text-sm font-semibold text-blue-400">Under Review</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// TaskSubtasks Component
function TaskSubtasks({ subtasks, loading = false }: { subtasks: Subtask[], loading?: boolean }) {
  const handleSubtaskClick = (subtask: Subtask) => {
    if (subtask.action.type === 'link' && subtask.action.url) {
      window.open(subtask.action.url, '_blank', 'noopener,noreferrer')
    } else if (subtask.action.type === 'upload' && subtask.action.uploadHandler) {
      subtask.action.uploadHandler()
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-white mb-6">Sub-tasks</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gradient-to-br from-[#191B24] to-[#181B28] border border-[#23263B] shadow-xl rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="h-8 w-8 bg-zinc-700/50 rounded-lg mr-4" />
                <div className="h-5 bg-zinc-700/50 rounded-lg flex-1 max-w-xs" />
              </div>
              <div className="h-6 w-16 bg-zinc-700/50 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!subtasks || subtasks.length === 0) return null

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white mb-6">Sub-tasks</h2>
      {subtasks.map((subtask) => (
        <div
          key={subtask.id}
          onClick={() => handleSubtaskClick(subtask)}
          className={cn(
            "bg-gradient-to-br from-[#191B24] to-[#181B28] border border-[#23263B] shadow-xl rounded-xl p-6 mb-5 cursor-pointer",
            "transition-all duration-200 hover:scale-[1.02] hover:ring-2 hover:ring-[#8c6cfb]/40 hover:shadow-2xl",
            "group relative overflow-hidden",
            subtask.completed && "opacity-75 bg-gradient-to-br from-[#1a2e1a] to-[#162416]"
          )}
        >
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#8c6cfb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          
          <div className="flex items-center justify-between relative z-10">
            {/* Left side: Icon + Title */}
            <div className="flex items-center flex-1 min-w-0">
              {getSubtaskIcon(subtask.icon)}
              
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-semibold text-base md:text-lg text-white truncate group-hover:text-[#8c6cfb] transition-colors">
                  {subtask.title}
                </h3>
                {subtask.completed && (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Completed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: XP Badge + Action */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* XP Badge */}
              <Badge className="rounded-full bg-[#222950] text-[#82EC40] font-semibold px-4 py-1.5 text-sm shadow-lg border border-[#82EC40]/20">
                {subtask.xp} XP
              </Badge>

              {/* Action Button/Icon */}
              {subtask.action.type === 'link' ? (
                <div className="w-8 h-8 rounded-full bg-[#8c6cfb]/20 flex items-center justify-center group-hover:bg-[#8c6cfb]/30 transition-colors">
                  <ArrowUpRight className="h-4 w-4 text-[#8c6cfb] group-hover:scale-110 transition-transform" />
                </div>
              ) : subtask.action.type === 'upload' ? (
                <Button
                  size="sm"
                  className="bg-gradient-to-tr from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-semibold px-4 py-2 rounded-full shadow-lg border-0 hover:scale-105 transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSubtaskClick(subtask)
                  }}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              ) : null}
            </div>
          </div>

          {/* Completion indicator */}
          {subtask.completed && (
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-400 to-green-600 rounded-l-xl" />
          )}
        </div>
      ))}
    </div>
  )
}

export default function TaskDetailPage() {
  const params = useParams()
  const [task, setTask] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showClaimModal, setShowClaimModal] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const { toast } = useToast()
  
  // Get taskId from params using useParams hook
  const taskId = params.id as string
  
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

  // File upload handler with comprehensive error handling
  const handleFileUpload = () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*,video/*,.pdf,.doc,.docx'
      input.multiple = true
      input.onchange = (e) => {
        try {
          const files = Array.from((e.target as HTMLInputElement).files || [])
          if (files.length > 0) {
            // Validate file sizes (10MB limit per file)
            const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024)
            if (invalidFiles.length > 0) {
              showFeedback('error', 'Some files are too large. Maximum size is 10MB per file.')
              return
            }

            setUploadedFiles(prev => [...prev, ...files])
            setUploadStatus('success')
            showFeedback('success', `${files.length} file(s) uploaded successfully`)
            toast({
              title: "Files uploaded successfully",
              description: `${files.length} file(s) added to your submission`,
            })
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          showFeedback('error', 'Failed to upload files. Please try again.')
          setUploadStatus('error')
        }
      }
      input.onerror = () => {
        showFeedback('error', 'File selection failed. Please try again.')
        setUploadStatus('error')
      }
      input.click()
    } catch (error) {
      console.error('File upload handler error:', error)
      showFeedback('error', 'Unable to open file selector. Please refresh and try again.')
    }
  }

  // Enhanced claim logic with comprehensive error handling
  const handleClaimReward = async () => {
    if (!task) {
      showFeedback('error', 'Task data not available. Please refresh the page.')
      return
    }
    
    try {
      // Show info feedback for processing
      showFeedback('info', 'Processing reward claim...')
      
      // Simulate claim processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success feedback
      showFeedback('success', 'Reward claim initiated successfully')
      
      // Show the centered modal
      setShowClaimModal(true)
    } catch (error) {
      console.error('Reward claim error:', error)
      showFeedback('error', 'Failed to claim reward. Please try again or contact support.')
    }
  }

  // Handle subtask completion with animations
  const handleSubtaskComplete = (subtaskId: string) => {
    const subtaskElement = document.querySelector(`[data-subtask-id="${subtaskId}"]`)
    const xpElement = subtaskElement?.querySelector('.task-subtask-xp')
    
    if (subtaskElement) {
      // Add completion state
      subtaskElement.classList.add('completed')
      
      // Animate XP counter
      if (xpElement) {
        xpElement.classList.add('animate-xp-award')
        
        // Remove animation class after completion
        setTimeout(() => {
          xpElement.classList.remove('animate-xp-award')
        }, 600)
      }
      
      // Show success feedback
      showFeedback('success', 'Sub-task completed successfully!')
    }
  }

  // Handle keyboard interactions for subtasks
  const handleSubtaskKeyDown = (event: React.KeyboardEvent, subtaskId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSubtaskComplete(subtaskId)
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
            <Link href="/tasks/daily">
              <Button className="btn-primary" aria-label="Return to daily tasks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
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
            <div className="status-chip ongoing">
              <span className="status-dot"></span>
              Ongoing
            </div>
            
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
            <header className="tasks-header">
              <h2 className="tasks-title">Sub-tasks</h2>
              <p className="tasks-subtitle">Complete all tasks to unlock rewards</p>
            </header>
            
            <div className="subtasks-list">
              {/* Share TokenX Post Sub-task - Full Button Card */}
              <button 
                onClick={() => window.open('https://x.com/CubaneSpace', '_blank', 'noopener,noreferrer')}
                className="subtask-button-card subtask-share-card"
                aria-label="Share TokenX Post on X.com"
              >
                <div className="subtask-icon-wrapper">
                  <ArrowUpRight className="subtask-icon" aria-hidden="true" />
                </div>
                <div className="subtask-content">
                  <h3 className="subtask-title">Share TokenX Post</h3>
                </div>
                <div className="subtask-xp-pill">52 XP</div>
              </button>
              
              {/* Upload Proof Sub-task - Full Button Card */}
              <button 
                onClick={handleFileUpload}
                className="subtask-button-card subtask-upload-card"
                aria-label="Upload files for task verification"
              >
                <div className="subtask-icon-wrapper">
                  <Upload className="subtask-icon" aria-hidden="true" />
                </div>
                <div className="subtask-content">
                  <h3 className="subtask-title">Upload proof/media for this task</h3>
                </div>
                <div className="subtask-xp-pill">22 XP</div>
              </button>

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files-indicator animate-fade-in" role="status" aria-live="polite">
                  <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                  <span>{uploadedFiles.length} file(s) uploaded successfully</span>
                </div>
              )}
            </div>
          </section>

          {/* Claim Now Block */}
          <div className="claim-block-section">
            <button 
              onClick={handleClaimReward}
              className="claim-now-card"
            >
              75 XP - Claim Now
            </button>
          </div>

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

      {/* Claim Status Modal */}
      <ClaimStatusModal
        open={showClaimModal}
        mode={task?.approvalWorkflow === 'manual' || task?.verificationMode === 'MANUAL' ? 'MANUAL' : 'AUTO'}
        xpAmount={task?.xp}
        rewardToken={task?.rewardToken}
        rewardAmount={task?.rewardAmount?.toString()}
        onClose={() => setShowClaimModal(false)}
      />
    </div>
  )
}
