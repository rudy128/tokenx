'use client'

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
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

async function getCampaignTask(campaignId: string, taskId: string) {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/tasks/${taskId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch campaign task')
    }
    
    const task = await response.json()
    
    if (!task) return null

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      instructions: task.instructions,
      xp: task.xp,
      taskType: task.taskType,
      frequency: task.frequency,
      evidenceMode: task.evidenceMode,
      approvalWorkflow: task.approvalWorkflow,
      verificationMode: task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL',
      status: task.status,
      createdAt: task.createdAt,
      // Generate two fixed subtasks for every campaign task
      subtasks: [
        // 1. Main Title Task - Action card that redirects to the given link
        {
          id: 'main-action',
          title: task.name, // Use the main task title
          xp: Math.floor((task.xp || 50) * 0.7), // 70% of main task XP for action
          icon: determineTaskIcon(task.taskType, task.instructions), // Determine icon based on platform/content
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
    console.error('Error fetching campaign task:', error)
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
  
  // Use task type or fallback to index cycling
  if (task.taskType) {
    const taskType = task.taskType.toLowerCase();
    if (taskType.includes('social') || taskType.includes('engagement')) return colors[0]!;
    if (taskType.includes('content') || taskType.includes('creation')) return colors[1]!;
    if (taskType.includes('community') || taskType.includes('referral')) return colors[2]!;
    if (taskType.includes('custom') || taskType.includes('technical')) return colors[3]!;
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

// Function to determine task icon based on task type and instructions
function determineTaskIcon(taskType?: string, instructions?: string): 'twitter' | 'discord' | 'document' | 'video' | 'share' | 'upload' {
  if (!taskType && !instructions) return 'document'
  
  const content = `${taskType || ''} ${instructions || ''}`.toLowerCase()
  
  if (content.includes('twitter') || content.includes('x.com') || content.includes('tweet') || content.includes('social')) {
    return 'twitter'
  }
  if (content.includes('discord') || content.includes('telegram')) {
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

export default function CampaignTaskDetailPage() {
  const params = useParams()
  const [task, setTask] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showClaimModal, setShowClaimModal] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [feedbackMessage, setFeedbackMessage] = React.useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null)
  const { toast } = useToast()
  
  const campaignId = params.id as string
  const taskId = params.taskId as string
  
  React.useEffect(() => {
    async function fetchTask() {
      if (!campaignId || !taskId) return
      
      try {
        setLoading(true)
        setError(null)
        const taskData = await getCampaignTask(campaignId, taskId)
        if (!taskData) {
          setError('Campaign task not found')
          return
        }
        setTask(taskData)
      } catch (error) {
        console.error('Error loading campaign task:', error)
        setError('Failed to load campaign task. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchTask()
  }, [campaignId, taskId])

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
        const taskData = await getCampaignTask(campaignId, taskId)
        if (!taskData) {
          setError('Campaign task not found')
          return
        }
        setTask(taskData)
      } catch (error) {
        console.error('Error loading campaign task:', error)
        setError('Failed to load campaign task. Please check your connection and try again.')
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
  
  // Skeleton loading state
  if (loading) {
    return (
      <div className="min-h-screen task-details-page" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        
        <main className="task-page-main">
          <div className="task-content-grid" role="status" aria-live="polite" aria-label="Loading campaign task details">
            
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
                aria-label="Retry loading campaign task"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href={`/dashboard/campaigns/${campaignId}/tasks`}>
                <Button 
                  variant="outline"
                  aria-label="Back to campaign tasks"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaign Tasks
                </Button>
              </Link>
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
            <h2 className="empty-title">Campaign Task Not Found</h2>
            <p className="empty-message">
              The campaign task you're looking for doesn't exist or may have been removed.
            </p>
            <Link href={`/dashboard/campaigns/${campaignId}/tasks`}>
              <Button className="btn-primary" aria-label="Return to campaign tasks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen task-details-page" style={{ background: 'var(--bg-primary)' }}>
      <NavBar />
      
      {/* Main Content Layout */}
      <main className="task-page-main">
        <div className="task-content-grid">
          
          {/* Header Section - Left */}
          <section className="task-header-left">
            <h1 className="project-title">{task.name}</h1>
            <h4 className="project-subtitle">{task.description || "Complete this campaign task to earn rewards"}</h4>
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
              Campaign Task
            </div>
            
            <div className="status-info">
              <span className="status-time">
                <Zap className="status-icon" />
                {task.xp} XP Reward
              </span>
            </div>
            
            <div className="status-avatars">
              <div className="avatar-group">
                <div className="avatar avatar-1"></div>
                <div className="avatar avatar-2"></div>
                <div className="avatar avatar-3"></div>
                <div className="avatar-count">Campaign</div>
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
              {/* Main Action Sub-task - Full Button Card */}
              <button 
                onClick={() => {
                  if (task.subtasks?.[0]?.action?.url) {
                    window.open(task.subtasks[0].action.url, '_blank', 'noopener,noreferrer')
                  }
                }}
                className="subtask-button-card subtask-share-card"
                aria-label={`Complete task: ${task.name}`}
              >
                <div className="subtask-icon-wrapper">
                  {getSubtaskIcon(task.subtasks?.[0]?.icon || 'document')}
                </div>
                <div className="subtask-content">
                  <h3 className="subtask-title">{task.name}</h3>
                </div>
                <div className="subtask-xp-pill">{task.subtasks?.[0]?.xp || Math.floor(task.xp * 0.7)} XP</div>
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
                <div className="subtask-xp-pill">{task.subtasks?.[1]?.xp || Math.floor(task.xp * 0.3)} XP</div>
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
              {task.xp} XP - Claim Now
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