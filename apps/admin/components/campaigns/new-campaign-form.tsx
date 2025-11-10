"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Eye,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Loader2,
  CheckSquare,
  Plus,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"
import TaskCard, { CampaignTask } from "./task-card"
import { SubTask } from "./subtask-row"

interface NewCampaignFormProps {
  userId: string
}

export default function NewCampaignForm({ userId }: NewCampaignFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    participantLimit: "",
    eligibilityCriteria: "",
    rewardPool: "",
    rewardToken: "USDT",
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED",
  })

  // Tasks state
  const [tasks, setTasks] = useState<CampaignTask[]>([])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  // Task management functions
  const addNewTask = () => {
    const newTask: CampaignTask = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      type: 'SOCIAL_ENGAGEMENT',
      xpReward: 0,
      isRequired: false,
      verificationMethod: 'MANUAL',
      subTasks: []
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (taskId: string, field: keyof CampaignTask, value: string | number | boolean) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ))
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const addSubTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubTask: SubTask = {
          id: crypto.randomUUID(),
          title: '',
          link: '',
          xpReward: 0,
          order: task.subTasks.length,
          isUploadProof: false,
          type: 'X_TWEET'
        }
        return { ...task, subTasks: [...task.subTasks, newSubTask] }
      }
      return task
    }))
  }

  const updateSubTask = (taskId: string, subTaskIndex: number, field: keyof SubTask, value: string | number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubTasks = [...task.subTasks]
        updatedSubTasks[subTaskIndex] = { ...updatedSubTasks[subTaskIndex], [field]: value }
        return { ...task, subTasks: updatedSubTasks }
      }
      return task
    }))
  }

  const removeSubTask = (taskId: string, subTaskIndex: number) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { 
          ...task, 
          subTasks: task.subTasks.filter((_, idx) => idx !== subTaskIndex)
        }
      }
      return task
    }))
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.name.trim()) {
      setError("Campaign name is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Start and end dates are required")
      setIsSubmitting(false)
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("End date must be after start date")
      setIsSubmitting(false)
      return
    }

    if (!formData.rewardPool || parseFloat(formData.rewardPool) <= 0) {
      setError("Reward pool must be greater than 0")
      setIsSubmitting(false)
      return
    }

    // Validate tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (!task.title.trim()) {
        setError(`Task ${i + 1}: Title is required`)
        setIsSubmitting(false)
        return
      }
      if (task.xpReward < 0) {
        setError(`Task ${i + 1}: XP reward must be 0 or greater`)
        setIsSubmitting(false)
        return
      }
      // Validate subtasks
      for (let j = 0; j < task.subTasks.length; j++) {
        const subTask = task.subTasks[j]
        if (!subTask.title.trim()) {
          setError(`Task ${i + 1}, Subtask ${j + 1}: Title is required`)
          setIsSubmitting(false)
          return
        }
        // Validate XP reward is non-negative
        if (subTask.xpReward < 0) {
          setError(`Task ${i + 1}, Subtask ${j + 1}: XP reward cannot be negative`)
          setIsSubmitting(false)
          return
        }
      }
    }

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          rewardPool: parseFloat(formData.rewardPool),
          participantLimit: formData.participantLimit ? parseInt(formData.participantLimit) : null,
          status: saveAsDraft ? "DRAFT" : formData.status,
          createdById: userId,
          tasks: tasks.map(task => ({
            title: task.title,
            description: task.description,
            type: task.type,
            xpReward: task.xpReward,
            isRequired: task.isRequired,
            verificationMethod: task.verificationMethod,
            subTasks: task.subTasks.map((subTask, index) => ({
              title: subTask.title,
              link: subTask.link?.trim() || null,
              xpReward: subTask.xpReward,
              order: index,
              isUploadProof: subTask.isUploadProof || false,
              type: subTask.type || 'X_TWEET'
            }))
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create campaign")
      }

      // Success - redirect to campaigns list
      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign")
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/campaigns"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              Back to Campaigns
            </Link>
            
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Create New Campaign
            </h1>
            <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
              Set up a new ambassador campaign with rewards and tasks
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--status-error-bg)',
                borderColor: 'var(--status-error)',
                color: 'var(--status-error)'
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={(e) => handleSubmit(e, false)}>
            {/* Basic Information */}
            <div 
              className="card mb-6"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <FileText size={24} style={{ color: 'var(--interactive-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Basic Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Campaign Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Campaign Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Q1 2025 Ambassador Program"
                    className="input"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the campaign goals, requirements, and benefits..."
                    className="input min-h-[120px]"
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Provide a clear description of what this campaign is about
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Initial Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="DRAFT">Draft (not visible to ambassadors)</option>
                    <option value="ACTIVE">Active (visible and open)</option>
                    <option value="PAUSED">Paused</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div 
              className="card mb-6"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <Calendar size={24} style={{ color: 'var(--interactive-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Campaign Timeline
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Participation */}
            <div 
              className="card mb-6"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <Users size={24} style={{ color: 'var(--interactive-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Participation Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Participant Limit */}
                <div>
                  <label htmlFor="participantLimit" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Participant Limit
                  </label>
                  <input
                    id="participantLimit"
                    name="participantLimit"
                    type="number"
                    min="1"
                    value={formData.participantLimit}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited"
                    className="input"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Maximum number of ambassadors who can join (optional)
                  </p>
                </div>

                {/* Eligibility Criteria */}
                <div>
                  <label htmlFor="eligibilityCriteria" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Eligibility Criteria
                  </label>
                  <textarea
                    id="eligibilityCriteria"
                    name="eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={handleChange}
                    placeholder="e.g., Minimum 1000 followers, Active Twitter account, Verified email..."
                    className="input min-h-[100px]"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Describe who can participate in this campaign (optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Tasks */}
            <div 
              className="card mb-6"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <CheckSquare size={24} style={{ color: 'var(--interactive-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Campaign Tasks
                </h2>
              </div>

              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Define tasks that ambassadors need to complete to earn rewards
              </p>

              {/* Task List */}
              <div className="space-y-4 mb-4">
                {tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onUpdate={updateTask}
                    onRemove={removeTask}
                    onAddSubTask={addSubTask}
                    onUpdateSubTask={updateSubTask}
                    onRemoveSubTask={removeSubTask}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addNewTask}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>

            {/* Rewards */}
            <div 
              className="card mb-6"
              style={{ 
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)'
              }}
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <DollarSign size={24} style={{ color: 'var(--interactive-primary)' }} />
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Rewards Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reward Pool */}
                <div>
                  <label htmlFor="rewardPool" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Total Reward Pool *
                  </label>
                  <input
                    id="rewardPool"
                    name="rewardPool"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewardPool}
                    onChange={handleChange}
                    placeholder="1000"
                    className="input"
                    required
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Total amount available for rewards
                  </p>
                </div>

                {/* Reward Token */}
                <div>
                  <label htmlFor="rewardToken" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Reward Token *
                  </label>
                  <select
                    id="rewardToken"
                    name="rewardToken"
                    value={formData.rewardToken}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="CUSTOM">Custom Token</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-default)' }}>
              <Link 
                href="/campaigns"
                className="btn btn-ghost"
              >
                Cancel
              </Link>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Eye size={18} />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Animation CSS */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </AdminLayout>
  )
}
