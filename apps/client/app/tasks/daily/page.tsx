"use client";

import React, { useEffect, useState, useMemo } from "react";
import { NavBar } from "@/components/NavBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Eye, Bookmark, Check, Ban, Clock, X, Loader2, AlertTriangle
} from "lucide-react";
import { validateTaskCompletion } from "@/lib/campaign-validation";

// Util for status
const statusIcon = (status: string) => {
  if (status === "completed") return <Check className="h-6 w-6" style={{ color: 'var(--status-success)' }} />;
  if (status === "pending") return <Clock className="h-6 w-6" style={{ color: 'var(--status-warning)' }} />;
  if (status === "rejected") return <Ban className="h-6 w-6" style={{ color: 'var(--status-danger)' }} />;
  return null;
};
const FILTERS = [
  { label: "All Tasks", value: "all" },
  { label: "Under Review", value: "pending" },
  { label: "Approved", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

// Theming utility
function getChainBadgeStyle(chain: string | undefined) {
  if (!chain) return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
  if (chain.toLowerCase().includes("bsc")) return { backgroundColor: 'var(--chain-bsc-bg)', color: 'var(--chain-bsc-text)' };
  if (chain.toLowerCase().includes("eth")) return { backgroundColor: 'var(--chain-eth-bg)', color: 'var(--chain-eth-text)' };
  if (chain.toLowerCase().includes("matic") || chain.toLowerCase().includes("polygon"))
    return { backgroundColor: 'var(--chain-polygon-bg)', color: 'var(--chain-polygon-text)' };
  return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
}

type Task = {
  id: string;
  title: string;
  name: string;
  description: string;
  bannerUrl?: string;
  image?: string;
  xpReward: number;
  rewardToken?: string;
  rewardAmount?: string;
  chain?: string;
  status: "available" | "pending" | "completed" | "rejected";
  verificationMode: "AUTO" | "MANUAL";
  platformName?: string;
  platformLogo?: string;
  tags: string[];
  bookmarked?: boolean;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  requirements: string[];
  campaignName?: string;
  submissionCount?: number;
  maxSubmissions?: number;
};

type ApiTask = Task;

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to transform API task to UI task
const transformApiTaskToTask = (apiTask: ApiTask): Task => ({
  ...apiTask,
  name: apiTask.title || apiTask.name,
  tags: apiTask.tags || [],
  requirements: apiTask.requirements || []
});

// Progress Bar Component
const ProgressBar = ({ value, max, className }: { value: number; max: number; className?: string }) => (
  <div className={cn("w-full bg-zinc-800 rounded-full overflow-hidden", className)}>
    <div
      className="bg-yellow-400 h-full rounded-full transition-all duration-300"
      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
    />
  </div>
);

// Get theme color based on task type/index for variety
const getTaskThemeColor = (task: Task, index?: number): string => {
  const colors = [
    'var(--color-primary-500)',    // Social/Primary tasks - Teal
    'var(--color-accent-500)',     // Content tasks - Purple
    'var(--color-success-500)',    // Growth tasks - Green  
    'var(--color-warning-500)'     // Info/Warning tasks - Amber
  ];
  
  // Use task tags or fallback to index cycling
  if (task.tags?.[0]) {
    const tag = task.tags[0].toLowerCase();
    if (tag.includes('social') || tag.includes('engagement') || tag.includes('daily')) return colors[0]!;
    if (tag.includes('content') || tag.includes('creation') || tag.includes('review')) return colors[1]!;
    if (tag.includes('growth') || tag.includes('referral') || tag.includes('general')) return colors[2]!;
    if (tag.includes('feedback') || tag.includes('video') || tag.includes('watch')) return colors[3]!;
  }
  
  // Fallback to cycling by index or task ID hash
  const taskIndex = index ?? parseInt(task.id.slice(-1)) ?? 0;
  return colors[taskIndex % colors.length]!;
};

// Task image fallback with accurate grid pattern
const TaskImageFallback = ({ task, index }: { task: Task; index?: number }) => {
  const themeColor = getTaskThemeColor(task, index);
  const taskTitle = (task.name || task.title);
  
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

// Clean task card with theme consistency and right-aligned image container
const TaskCard = ({ task, onViewDetails, index }: { task: Task; onViewDetails: (task: Task) => void; index?: number }) => (
  <div className="task-card" onClick={() => onViewDetails(task)}>
    <div className="task-card-content">
      <span className="task-title">{task.name || task.title}</span>
      <span className="task-desc">{task.description}</span>
      
      <div className="task-meta-row">
        <span className="badge badge-primary">DAILY</span>
        <div className="task-xp-set">
          <span className="task-xp-value">{task.xpReward}</span>
          <span className="badge badge-success">XP</span>
        </div>
        <span className="badge badge-secondary">{task.difficulty || "Medium"}</span>
      </div>
      
      <div className="task-program">
        TokenX Ambassador Program · {task.tags?.[0] || 'CONTENT_CREATION'}
      </div>
      
      <button 
        className="btn-primary"
        onClick={(e) => { e.stopPropagation(); onViewDetails(task); }}
      >
        View Details
      </button>
    </div>
    
    <div className="task-image-container">
      {task.image || task.bannerUrl ? (
        <img 
          src={task.image || task.bannerUrl} 
          alt={task.title || task.name} 
          className="task-image"
        />
      ) : (
        <TaskImageFallback task={task} index={index} />
      )}
    </div>
  </div>
);

function DailyTaskSkeleton() {
  return (
    <div className="task-card animate-pulse">
      <div className="task-card-content">
        {/* Title placeholder */}
        <div 
          className="h-6 rounded" 
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            width: '70%'
          }} 
        />
        
        {/* Description placeholder */}
        <div className="space-y-2">
          <div 
            className="h-4 rounded" 
            style={{ backgroundColor: 'var(--bg-tertiary)' }} 
          />
          <div 
            className="h-4 rounded" 
            style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '80%'
            }} 
          />
        </div>

        {/* Meta row placeholder */}
        <div className="task-meta-row">
          <div 
            className="badge" 
            style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '60px'
            }} 
          />
          <div className="task-xp-set">
            <div 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                width: '30px',
                height: '1rem',
                borderRadius: 'var(--radius-sm)'
              }} 
            />
            <div 
              className="badge" 
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                width: '30px'
              }} 
            />
          </div>
          <div 
            className="badge" 
            style={{ 
              backgroundColor: 'var(--bg-tertiary)', 
              width: '70px'
            }} 
          />
        </div>

        {/* Program placeholder */}
        <div 
          className="h-4 rounded" 
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            width: '60%'
          }} 
        />

        {/* Button placeholder */}
        <div 
          className="h-10 rounded" 
          style={{ backgroundColor: 'var(--bg-tertiary)' }} 
        />
      </div>
      
      {/* Image placeholder on the right */}
      <div 
        className="task-image-container" 
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      />
    </div>
  );
}

// Perfect themed task details modal
const TaskDetailsModal = ({ task, isOpen, onClose, onStartTask }: { 
  task: Task | null; 
  isOpen: boolean; 
  onClose: () => void; 
  onStartTask: (taskId: string) => void;
}) => {
  const { toast } = useToast();

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
          {task.image || task.bannerUrl ? (
            <img 
              src={task.image || task.bannerUrl} 
              alt={task.title || task.name} 
              className="task-modal-banner-img"
            />
          ) : (
            <div className="task-modal-banner-fallback" style={{ backgroundColor: getTaskThemeColor(task) }}>
              <div className="grid-bg"></div>
              <div className="task-modal-banner-title">
                {task.name || task.title}
              </div>
            </div>
          )}
        </div>

        {/* Content section below banner */}
        <div className="task-modal-content">
          {/* Title (if image exists, show title here too) */}
          {(task.image || task.bannerUrl) && (
            <h2 id="task-modal-title" className="task-modal-title">
              {task.name || task.title}
            </h2>
          )}

          {/* Badge row */}
          <div className="task-modal-badges">
            <span className="badge badge-primary">DAILY</span>
            <div className="task-xp-set">
              <span className="task-xp-value">{task.xpReward}</span>
              <span className="badge badge-success">XP</span>
            </div>
            <span className="badge badge-secondary">{task.difficulty || "Medium"}</span>
            {task.verificationMode && (
              <span className="badge badge-info">
                {task.verificationMode === "AUTO" ? "AUTO-VERIFIED" : "MANUAL REVIEW"}
              </span>
            )}
          </div>

          {/* Task description */}
          <p className="task-modal-description">
            {task.description}
          </p>

          {/* Requirements */}
          {task.requirements && task.requirements.length > 0 && (
            <div className="task-modal-requirements">
              <h3 className="task-modal-section-title">Requirements</h3>
              <ul className="task-modal-list">
                {task.requirements.map((req, i) => (
                  <li key={i} className="task-modal-list-item">
                    <span className="task-modal-bullet">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification info */}
          {task.verificationMode && (
            <div className="task-modal-verification">
              <h3 className="task-modal-section-title">Verification Process</h3>
              <div className="task-modal-verification-content">
                {task.verificationMode === "AUTO" ? (
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
          )}

          {/* Program info */}
          <div className="task-modal-program">
            TokenX Ambassador Program · {task.tags?.[0] || 'CONTENT_CREATION'}
          </div>
        </div>

        {/* Action footer */}
        <div className="task-modal-footer">
          <button
            className="btn-primary task-modal-action"
            onClick={() => {
              // Validate with Zod before starting task
              const validationResult = validateTaskCompletion({
                taskId: task.id,
                userId: 'current-user',
                campaignId: task.campaignName || 'unknown',
                evidence: {
                  description: 'Task completion evidence'
                }
              });

              if (!validationResult.success) {
                toast({
                  title: "Validation Error",
                  description: validationResult.error.errors[0]?.message || 'Invalid task completion request',
                  variant: "destructive"
                });
                return;
              }

              onStartTask(task.id);
            }}
          >
            Start Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DailyTasksPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]?.value || "all");
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // API integration - using the daily tasks endpoint
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks/daily');
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please sign in to view tasks');
        }
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await res.json();
      
      // Handle daily tasks API response format
      if (data.success && data.data && Array.isArray(data.data)) {
        // Extract tasks from campaigns
        const allTasks: Task[] = [];
        data.data.forEach((campaign: any) => {
          if (campaign.tasks && Array.isArray(campaign.tasks)) {
            campaign.tasks.forEach((task: any) => {
              allTasks.push({
                id: task.id,
                name: task.name,
                title: task.name,
                description: task.description || "Complete this task to earn rewards",
                xpReward: task.xp || task.xpReward || 50,
                rewardToken: task.rewardToken,
                rewardAmount: task.rewardAmount ? task.rewardAmount.toString() : undefined,
                status: task.status === 'available' ? 'available' : 
                        task.status === 'submitted' ? 'pending' : 
                        task.status === 'approved' ? 'completed' : 'available',
                verificationMode: task.approvalWorkflow === 'auto' ? "AUTO" : "MANUAL",
                difficulty: "medium",
                estimatedTime: task.frequency === 'daily' ? "Daily" : "10 min",
                requirements: task.instructions ? [task.instructions] : ["Complete the required action"],
                tags: [task.taskType || "general"],
                campaignName: campaign.name,
                bookmarked: false
              });
            });
          }
        });
        setTasks(allTasks);
      } else {
        // Fallback to mock data
        const mockTasks: Task[] = [
          {
            id: "1",
            name: "Share Daily Update",
            title: "Share Daily Update",
            description: "Share your daily progress on social media platforms",
            xpReward: 50,
            status: "available",
            verificationMode: "AUTO",
            difficulty: "easy",
            estimatedTime: "5 min",
            requirements: ["Post on at least 2 platforms", "Include #DailyProgress hashtag", "Tag @YourBrand"],
            tags: ["social", "daily", "engagement"],
            campaignName: "Daily Engagement Campaign",
            bookmarked: false
          },
          {
            id: "2",
            name: "Review Product Demo",
            title: "Review Product Demo",
            description: "Watch and review our latest product demonstration video",
            xpReward: 75,
            status: "pending",
            verificationMode: "MANUAL",
            difficulty: "medium",
            estimatedTime: "15 min",
            requirements: ["Watch full video", "Provide detailed feedback", "Rate on scale of 1-10"],
            tags: ["review", "video", "feedback"],
            campaignName: "Q4 Product Launch",
            bookmarked: true
          }
        ];
        setTasks(mockTasks);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load tasks",
        variant: "destructive"
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    if (selectedFilter === "all") return tasks;
    return tasks.filter((t) => t.status === selectedFilter);
  }, [selectedFilter, tasks]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main className="daily-tasks-main">
        <div className="page-container">
            
            {/* Modern themed header section */}
            <div className="daily-tasks-header">
              <div className="header-accent-bar"></div>
              <h1 className="daily-tasks-title">Daily Tasks</h1>
              <p className="daily-tasks-subtitle">
                Complete tasks to earn XP and unlock exclusive rewards
              </p>
            </div>

            {/* Tab navigation bar */}
            <div className="daily-tasks-nav-container">
              <nav className="tasks-tabs">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedFilter(f.value)}
                    className={cn(
                      "tasks-tab",
                      selectedFilter === f.value && "tasks-tab-active"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Task cards section */}
            <div className="tasks-section">
              {loading ? (
                <div className="tasks-list">
                  {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                    <DailyTaskSkeleton key={idx} />
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-tasks-card">
                  <span className="empty-title">No tasks found</span>
                  <span className="empty-desc">Check back later to find more ways to earn XP and rewards!</span>
                  <button 
                    className="btn-primary"
                    onClick={() => router.push('/campaigns')}
                  >
                    Browse Campaigns
                  </button>
                </div>
              ) : (
                <div className="tasks-list">
                  {filteredTasks.map((task, index) => (
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

        {/* Task Details Modal */}
        <TaskDetailsModal 
          task={modalTask} 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onStartTask={(taskId) => {
            setModalOpen(false);
            router.push(`/tasks/daily/${taskId}`);
          }}
        />
        </div>
      </main>
    </div>
  );
}
