"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { NavBar } from "@/components/NavBar"
import { Button } from "@/components/ui/button"

import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, CheckCircle, Zap, Target, X
} from "lucide-react"
import React from "react"

interface Task {
  id: string
  name: string
  description: string
  instructions: string
  xp: number
  taskType: string
  frequency: string
  evidenceMode: string
  approvalWorkflow: string
  status: 'available' | 'submitted' | 'approved' | 'rejected'
  submissionStatus?: string
  submittedAt?: string
  rejectionReason?: string
}

interface Campaign {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "DRAFT" | "COMPLETED" | "PAUSED" | "CANCELLED"
  startDate: string
  endDate: string
  participantLimit: number
  currentParticipants: number
  rewardPool: number
  rewardToken: string
  eligibilityCriteria: string[]
  bannerUrl?: string
  image?: string
  isJoined?: boolean
  userProgress?: {
    completedTasks: number
    totalTasks: number
    earnedXP: number
  }
  tags?: string[]
  difficulty?: "easy" | "medium" | "hard"
  estimatedDuration?: string
}

export default function CampaignTasksPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalTask, setModalTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const campaignId = params.id as string

  useEffect(() => {
    if (!campaignId) return
    const fetchCampaignAndTasks = async () => {
      setLoading(true)
      try {
        // Fetch campaign details
        const campaignRes = await fetch(`/api/campaigns/${campaignId}`)
        if (!campaignRes.ok) throw new Error("Campaign not found")
        const campaignData = await campaignRes.json()
        setCampaign(campaignData)

        // Fetch campaign tasks
        const tasksRes = await fetch(`/api/campaigns/${campaignId}/tasks`)
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json()
          setTasks(Array.isArray(tasksData) ? tasksData : [])
        } else {
          setTasks([])
        }
      } catch (err) {
        toast({
          title: "Error loading campaign",
          description: "The requested campaign could not be found.",
          variant: "destructive"
        })
        router.push("/dashboard/campaigns")
      }
      setLoading(false)
    }
    fetchCampaignAndTasks()
  }, [campaignId, router, toast])

  const handleStartTask = (taskId: string) => {
    // Route to the campaign-specific task page to maintain context
    router.push(`/dashboard/campaigns/${campaignId}/tasks/${taskId}`)
  }



  // Get theme color based on task type for variety
  const getTaskThemeColor = (task: Task, index?: number): string => {
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

  // Task image fallback with accurate grid pattern (same as daily tasks)
  const TaskImageFallback = ({ task, index }: { task: Task; index?: number }) => {
    const themeColor = getTaskThemeColor(task, index);
    const taskTitle = task.name;
    
    return (
      <div 
        className="task-image-container-fallback" 
        style={{ backgroundColor: themeColor }}
      >
        <div className="grid-bg"></div>
        <div className="grid-title-wrapper">
          <span className="grid-title">{taskTitle}</span>
        </div>
      </div>
    );
  };

  // EXACT SAME TaskCard as daily tasks page - campaign card structure
  const TaskCard = ({ task, onViewDetails, index }: { task: Task; onViewDetails: (task: Task) => void; index?: number }) => (
    <div className="campaign-card" onClick={() => onViewDetails(task)}>
      {/* Banner Section - using exact same styling as modal banner */}
      <div className="campaign-card-banner-container">
        <div className="task-modal-banner">
          <div className="task-modal-banner-fallback" style={{ backgroundColor: getTaskThemeColor(task, index) }}>
            <div className="grid-bg"></div>
            <div className="task-modal-banner-title">
              {task.name}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Area - matching campaign card structure */}
      <div className="campaign-card-content">
        {/* Header */}
        <div className="campaign-card-header">
          <h3 className="campaign-card-title">
            {task.name}
          </h3>
          <p className="campaign-card-description">
            {task.description}
          </p>
        </div>
        
        {/* Stats - using same structure as campaign card */}
        <div className="campaign-card-stats">
          <div className="campaign-card-stat">
            <div className="campaign-card-stat-icon-wrapper participants">
              <Zap className="campaign-card-stat-icon" />
            </div>
            <div className="campaign-card-stat-content">
              <div className="campaign-card-stat-value">{task.xp}</div>
              <div className="campaign-card-stat-label">XP Reward</div>
            </div>
          </div>
          <div className="campaign-card-stat">
            <div className="campaign-card-stat-icon-wrapper tokens">
              <Target className="campaign-card-stat-icon" />
            </div>
            <div className="campaign-card-stat-content">
              <div className="campaign-card-stat-value">{task.verificationMethod || (task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL')}</div>
              <div className="campaign-card-stat-label">Verification</div>
            </div>
          </div>
        </div>
        
        {/* Program info */}
        <div className="campaign-card-dates">
          <div className="campaign-card-date">
            <span>{campaign?.name || 'TokenX Ambassador Program'} · {task.taskType || 'CAMPAIGN_TASK'}</span>
          </div>
        </div>
        
        {/* Footer with button */}
        <div className="campaign-card-footer">
          <div className="campaign-card-divider"></div>
          <button 
            onClick={(e) => { e.stopPropagation(); onViewDetails(task); }}
            className="campaign-card-button joined"
          >
            <CheckCircle className="campaign-card-button-icon" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  // Task Details Modal (same as daily tasks page)
  const TaskDetailsModal = ({ task, isOpen, onClose, onStartTask }: { 
    task: Task | null; 
    isOpen: boolean; 
    onClose: () => void; 
    onStartTask: (taskId: string) => void;
  }) => {
    // Handle escape key and outside click
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    };

    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.body.style.overflow = 'unset';
        };
      }
    }, [isOpen]);

    if (!isOpen || !task) return null;

    return (
      <div 
        className="task-modal-overlay"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="task-modal-container">
          {/* Close button */}
          <button 
            className="task-modal-close"
            onClick={onClose}
            aria-label="Close task details"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Banner image section at top */}
          <div className="task-modal-banner">
            <div className="task-modal-banner-fallback" style={{ backgroundColor: getTaskThemeColor(task) }}>
              <div className="grid-bg"></div>
              <div className="task-modal-banner-title">
                {task.name}
              </div>
            </div>
          </div>

          {/* Content section below banner */}
          <div className="task-modal-content">
            {/* Badge row */}
            <div className="task-modal-badges">
              <span className="badge badge-primary">CAMPAIGN</span>
              <div className="task-xp-set">
                <span className="task-xp-value">{task.xp}</span>
                <span className="badge badge-success">XP</span>
              </div>
              <span className="badge badge-secondary">
                {task.verificationMethod || (task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL')}
              </span>
              <span className="badge badge-info">
                {(task.verificationMethod || task.approvalWorkflow)?.toUpperCase().includes('AUTO') ? "AUTO-VERIFIED" : "MANUAL REVIEW"}
              </span>
            </div>

            {/* Task description */}
            <p className="task-modal-description">
              {task.description}
            </p>

            {/* Requirements */}
            <div className="task-modal-requirements">
              <h3 className="task-modal-section-title">Requirements</h3>
              <ul className="task-modal-list">
                <li className="task-modal-list-item">
                  <span className="task-modal-bullet">•</span>
                  {task.instructions}
                </li>
              </ul>
            </div>

            {/* Verification info */}
            <div className="task-modal-verification">
              <h3 className="task-modal-section-title">Verification Process</h3>
              <div className="task-modal-verification-content">
                {(task.verificationMethod || task.approvalWorkflow)?.toUpperCase().includes('AUTO') ? (
                  <>
                    <span className="task-modal-verification-type">Auto-Verified Task</span>
                    <p className="task-modal-verification-desc">
                      Complete the task as instructed. The system will automatically verify your submission.
                    </p>
                  </>
                ) : (
                  <>
                    <span className="task-modal-verification-type">Manual Review</span>
                    <p className="task-modal-verification-desc">
                      Submit proof of completion. Your submission will be reviewed by our team within 24-48 hours.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Program info */}
            <div className="task-modal-program">
              {campaign?.name || 'TokenX Ambassador Program'} · {task.taskType || 'CAMPAIGN_TASK'}
            </div>
          </div>

          {/* Action footer */}
          <div className="task-modal-footer">
            <button
              className="btn-primary task-modal-action"
              onClick={() => onStartTask(task.id)}
            >
              Start Task
            </button>
          </div>
        </div>
      </div>
    );
  };

  // EXACT SAME Skeleton as daily tasks page
  function CampaignTaskSkeleton() {
    return (
      <div className="campaign-card animate-pulse">
        {/* Banner Section - exact same structure as TaskCard */}
        <div className="campaign-card-banner-container">
          <div className="task-modal-banner">
            <div 
              className="task-modal-banner-fallback" 
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            />
          </div>
        </div>
        
        {/* Content Area - exact same structure as TaskCard */}
        <div className="campaign-card-content">
          {/* Header */}
          <div className="campaign-card-header">
            <div 
              className="h-6 rounded" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                width: '70%',
                marginBottom: 'var(--space-2)'
              }} 
            />
            <div 
              className="h-4 rounded" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                marginBottom: 'var(--space-1)'
              }} 
            />
            <div 
              className="h-4 rounded" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                width: '80%'
              }} 
            />
          </div>
          
          {/* Stats - exact same structure as TaskCard */}
          <div className="campaign-card-stats">
            <div className="campaign-card-stat">
              <div 
                className="campaign-card-stat-icon-wrapper participants" 
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              />
              <div className="campaign-card-stat-content">
                <div 
                  className="h-5 rounded" 
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    width: '40px',
                    marginBottom: 'var(--space-1)'
                  }} 
                />
                <div 
                  className="h-3 rounded" 
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    width: '60px'
                  }} 
                />
              </div>
            </div>
            <div className="campaign-card-stat">
              <div 
                className="campaign-card-stat-icon-wrapper tokens" 
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              />
              <div className="campaign-card-stat-content">
                <div 
                  className="h-5 rounded" 
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    width: '50px',
                    marginBottom: 'var(--space-1)'
                  }} 
                />
                <div 
                  className="h-3 rounded" 
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    width: '55px'
                  }} 
                />
              </div>
            </div>
          </div>
          
          {/* Program info - exact same structure as TaskCard */}
          <div className="campaign-card-dates">
            <div className="campaign-card-date">
              <div 
                className="h-4 rounded" 
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  width: '250px'
                }} 
              />
            </div>
          </div>
          
          {/* Footer - exact same structure as TaskCard */}
          <div className="campaign-card-footer">
            <div className="campaign-card-divider" />
            <div 
              className="h-10 rounded" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                width: '100%'
              }} 
            />
          </div>
        </div>
      </div>
    );
  }



  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <NavBar />
        <main className="dashboard-main">
          {/* Header Skeleton - Keep Original Dashboard Structure */}
          <div className="campaigns-header-section">
            <div className="campaigns-hero-content">
              {/* Back button skeleton - exact structure */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="w-28 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Title skeleton - using same class structure as real content */}
              <div className="campaigns-main-title">
                <div className="bg-gray-700 rounded animate-pulse" style={{ height: '1em', width: '70%', margin: '0 auto' }}></div>
              </div>
              
              {/* Subtitle skeleton - using same class structure as real content */}
              <div className="campaigns-main-subtitle">
                <div className="bg-gray-700 rounded animate-pulse" style={{ height: '1em', width: '85%', margin: '0 auto' }}></div>
              </div>
            </div>

            {/* Stats Cards Skeleton - Same grid layout */}
            <div className="campaigns-stats-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="campaigns-stat-card campaigns-stat-card-primary">
                  <div className="campaigns-stat-content">
                    <div className="campaigns-stat-info">
                      {/* Stat label skeleton */}
                      <div className="w-20 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      {/* Stat value skeleton */}
                      <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="campaigns-stat-icon campaigns-stat-icon-primary">
                      {/* Icon skeleton */}
                      <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Section Skeleton - Use Daily Tasks Structure */}
          <div className="page-container">
            {/* Tasks Section Title Skeleton */}
            <div className="daily-tasks-header" style={{ marginTop: 'var(--space-8)' }}>
              <div className="w-48 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="w-96 h-4 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Tasks Section Skeleton */}
            <div className="tasks-section">
              <div className="tasks-list">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <CampaignTaskSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <NavBar />
        <main className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 text-white">Campaign Not Found</h1>
            <p className="text-gray-300 mb-4">The requested campaign could not be found.</p>
            <Button onClick={() => router.push('/dashboard/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main className="dashboard-main">
        {/* Header Section - Keep Original Dashboard Structure */}
        <div className="campaigns-header-section">
          <div className="campaigns-hero-content">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaign
              </Button>
            </div>
            <h1 className="campaigns-main-title">
              {campaign.name}
            </h1>
            <p className="campaigns-main-subtitle">
              Complete these tasks to earn XP and contribute to the campaign goals
            </p>
          </div>

          {/* Stats Cards */}
          <div className="campaigns-stats-grid">
            <div className="campaigns-stat-card campaigns-stat-card-primary">
              <div className="campaigns-stat-content">
                <div className="campaigns-stat-info">
                  <p className="campaigns-stat-label">Total Tasks</p>
                  <p className="campaigns-stat-value">{tasks.length}</p>
                </div>
                <div className="campaigns-stat-icon campaigns-stat-icon-primary">
                  <Target className="campaigns-icon" />
                </div>
              </div>
            </div>

            <div className="campaigns-stat-card campaigns-stat-card-success">
              <div className="campaigns-stat-content">
                <div className="campaigns-stat-info">
                  <p className="campaigns-stat-label">Completed</p>
                  <p className="campaigns-stat-value">{tasks.filter(t => t.status === 'approved').length}</p>
                </div>
                <div className="campaigns-stat-icon campaigns-stat-icon-success">
                  <CheckCircle className="campaigns-icon" />
                </div>
              </div>
            </div>

            <div className="campaigns-stat-card campaigns-stat-card-warning">
              <div className="campaigns-stat-content">
                <div className="campaigns-stat-info">
                  <p className="campaigns-stat-label">XP Available</p>
                  <p className="campaigns-stat-value">{tasks.reduce((sum, task) => sum + task.xp, 0)}</p>
                </div>
                <div className="campaigns-stat-icon campaigns-stat-icon-warning">
                  <Zap className="campaigns-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section - Use Daily Tasks Structure for Proper Spacing */}
        <div className="page-container">
          {/* Campaign Tasks Section Title */}
          <div className="daily-tasks-header" style={{ marginTop: 'var(--space-8)' }}>
            <div className="header-accent-bar"></div>
            <h2 className="daily-tasks-title" style={{ fontSize: 'var(--font-size-2xl)' }}>
              Campaign Tasks
            </h2>
            <p className="daily-tasks-subtitle">
              Complete these tasks to earn XP and unlock exclusive rewards
            </p>
          </div>

          {/* Task cards section - EXACT SAME AS DAILY TASKS */}
          <div className="tasks-section">
            {loading ? (
              <div className="tasks-list">
                {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                  <CampaignTaskSkeleton key={idx} />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-tasks-card">
                <span className="empty-title">No tasks found</span>
                <span className="empty-desc">No tasks available for this campaign yet. Check back later!</span>
                <button 
                  className="btn-primary"
                  onClick={() => router.push('/dashboard/campaigns')}
                >
                  Browse Other Campaigns
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task, index) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onViewDetails={(task) => { 
                      setModalTask(task); 
                      setModalOpen(true); 
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Details Modal */}
        <TaskDetailsModal 
          task={modalTask} 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onStartTask={(taskId) => {
            setModalOpen(false);
            handleStartTask(taskId);
          }}
        />
      </main>
    </div>
  )
}