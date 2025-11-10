"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Award,
  FileText,
  Loader2,
  Plus,
  Edit,
  X,
  Target,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

interface TaskSubTask {
  id: string
  title: string
  description: string | null
  xpReward: number
  link: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

interface Task {
  id: string
  campaignId: string
  name: string
  description: string
  category: string
  xpReward: number
  verificationMethod: string
  requirements: unknown
  status: string
  createdAt: Date
  updatedAt: Date
  Campaign: {
    id: string
    name: string
  }
  taskSubTasks: TaskSubTask[]
}

interface Campaign {
  id: string
  name: string
  status: string
}

interface EditTaskFormProps {
  task: Task
  campaigns: Campaign[]
  userId: string
}

type SubTaskType = 
  | 'X_LIKE'
  | 'X_COMMENT'
  | 'X_SHARE'
  | 'X_SPACE_HOST'
  | 'X_QUOTE'
  | 'X_RETWEET'
  | 'X_TWEET'
  | 'X_CUSTOM'

interface SubtaskFormData {
  id?: string
  title: string
  description: string
  xpReward: string
  link: string
  order: number
  type: SubTaskType
}

interface SubtaskModalProps {
  subtask: SubtaskFormData
  onSave: (data: SubtaskFormData) => void
  onClose: () => void
}

export default function EditTaskForm({ task, campaigns }: EditTaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")
  const [showSubtaskModal, setShowSubtaskModal] = useState(false)
  const [editingSubtask, setEditingSubtask] = useState<SubtaskFormData | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description,
    campaignId: task.campaignId,
    category: task.category,
    xpReward: task.xpReward.toString(),
    verificationMethod: task.verificationMethod,
    status: task.status,
  })

  const [subtasks, setSubtasks] = useState<TaskSubTask[]>(task.taskSubTasks)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Task name is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (!formData.xpReward || parseInt(formData.xpReward) <= 0) {
      setError("XP reward must be greater than 0")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          campaignId: formData.campaignId,
          category: formData.category,
          xpReward: parseInt(formData.xpReward),
          verificationMethod: formData.verificationMethod,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task")
      }

      router.push("/tasks")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${task.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      router.push("/tasks")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  // Subtask handlers
  const handleAddSubtask = () => {
    setEditingSubtask({
      title: "",
      description: "",
      xpReward: "10",
      link: "",
      order: subtasks.length,
      type: 'X_TWEET',
    })
    setShowSubtaskModal(true)
  }

  const handleEditSubtask = (subtask: TaskSubTask) => {
    setEditingSubtask({
      id: subtask.id,
      title: subtask.title,
      description: subtask.description || "",
      xpReward: subtask.xpReward.toString(),
      link: subtask.link || "",
      order: subtask.order,
      type: (subtask as any).type || 'X_TWEET',
    })
    setShowSubtaskModal(true)
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm("Are you sure you want to delete this sub-task?")) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}/subtasks/${subtaskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete sub-task")
      }

      setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete sub-task")
    }
  }

  const handleSaveSubtask = async (subtaskData: SubtaskFormData) => {
    try {
      const isEditing = !!subtaskData.id
      const url = isEditing 
        ? `/api/tasks/${task.id}/subtasks/${subtaskData.id}`
        : `/api/tasks/${task.id}/subtasks`
      
      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: subtaskData.title.trim(),
          description: subtaskData.description.trim() || null,
          xpReward: parseInt(subtaskData.xpReward),
          link: subtaskData.link.trim() || null,
          order: subtaskData.order,
          type: subtaskData.type || 'X_TWEET',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save sub-task")
      }

      if (isEditing) {
        setSubtasks(prev => prev.map(st => 
          st.id === subtaskData.id ? { ...st, ...data } : st
        ))
      } else {
        setSubtasks(prev => [...prev, data])
      }

      setShowSubtaskModal(false)
      setEditingSubtask(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sub-task")
    }
  }

  return (
    <AdminLayout>
      <div className="admin-edit-form-container">
        {/* Header */}
        <div className="admin-edit-form-header">
          <Link href="/tasks" className="btn btn-secondary flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Tasks
          </Link>

          <div className="admin-edit-form-title-row">
            <h1 className="admin-edit-form-title">Edit Task</h1>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-danger flex items-center gap-2"
            >
              <Trash2 size={18} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {error && (
          <div className="admin-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-edit-form">
          {/* Basic Information Section */}
          <div className="admin-form-section">
            <div className="admin-form-section-header">
              <FileText size={20} />
              <h2 className="admin-form-section-title">Basic Information</h2>
            </div>
            <div className="admin-form-section-content">
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label htmlFor="name" className="admin-form-label">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-field admin-form-field-full">
                  <label htmlFor="description" className="admin-form-label">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="admin-form-textarea"
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="status" className="admin-form-label">
                    Status *
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="admin-form-select"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="category" className="admin-form-label">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="admin-form-select"
                    required
                  >
                    <option value="SOCIAL_ENGAGEMENT">Social Engagement</option>
                    <option value="CONTENT_CREATION">Content Creation</option>
                    <option value="COMMUNITY_BUILDING">Community Building</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Association Section */}
          <div className="admin-form-section">
            <div className="admin-form-section-header">
              <Target size={20} />
              <h2 className="admin-form-section-title">Campaign Association</h2>
            </div>
            <div className="admin-form-section-content">
              <div className="admin-form-field">
                <label htmlFor="campaignId" className="admin-form-label">
                  Campaign *
                </label>
                <select
                  id="campaignId"
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleInputChange}
                  className="admin-form-select"
                  required
                >
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rewards Section */}
          <div className="admin-form-section">
            <div className="admin-form-section-header">
              <Award size={20} />
              <h2 className="admin-form-section-title">Rewards</h2>
            </div>
            <div className="admin-form-section-content">
              <div className="admin-form-grid">
                <div className="admin-form-field">
                  <label htmlFor="xpReward" className="admin-form-label">
                    XP Reward *
                  </label>
                  <input
                    type="number"
                    id="xpReward"
                    name="xpReward"
                    value={formData.xpReward}
                    onChange={handleInputChange}
                    min="1"
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label htmlFor="verificationMethod" className="admin-form-label">
                    Verification Method *
                  </label>
                  <select
                    id="verificationMethod"
                    name="verificationMethod"
                    value={formData.verificationMethod}
                    onChange={handleInputChange}
                    className="admin-form-select"
                    required
                  >
                    <option value="MANUAL">Manual Review</option>
                    <option value="AI_AUTO">AI Automatic</option>
                    <option value="HYBRID">Hybrid (AI + Manual)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-tasks Section */}
          <div className="admin-form-section">
            <div className="admin-form-section-header">
              <FileText size={20} />
              <h2 className="admin-form-section-title">Sub-tasks ({subtasks.length})</h2>
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn btn-sm btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                Add Sub-task
              </button>
            </div>
            <div className="admin-form-section-content">
              {subtasks.length === 0 ? (
                <div className="admin-empty-state">
                  <p className="text-gray-500">No sub-tasks yet. Add your first sub-task to break down this task.</p>
                </div>
              ) : (
                <div className="admin-subtasks-list">
                  {subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="admin-subtask-item">
                      <div className="admin-subtask-content">
                        <div className="admin-subtask-header">
                          <span className="admin-subtask-order">#{index + 1}</span>
                          <h3 className="admin-subtask-title">{subtask.title}</h3>
                          <span className="admin-subtask-xp">{subtask.xpReward} XP</span>
                        </div>
                        {subtask.description && (
                          <p className="admin-subtask-description">{subtask.description}</p>
                        )}
                        {subtask.link && (
                          <a 
                            href={subtask.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="admin-subtask-link"
                          >
                            {subtask.link}
                          </a>
                        )}
                      </div>
                      <div className="admin-subtask-actions">
                        <button
                          type="button"
                          onClick={() => handleEditSubtask(subtask)}
                          className="btn btn-sm btn-secondary"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="btn btn-sm btn-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="admin-form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Subtask Modal */}
        {showSubtaskModal && editingSubtask && (
          <SubtaskModal
            subtask={editingSubtask}
            onSave={handleSaveSubtask}
            onClose={() => {
              setShowSubtaskModal(false)
              setEditingSubtask(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

// Subtask Modal Component
function SubtaskModal({
  subtask,
  onSave,
  onClose,
}: SubtaskModalProps) {
  const [formData, setFormData] = useState<SubtaskFormData>(subtask)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const SUB_TASK_TYPE_OPTIONS: { value: SubTaskType; label: string }[] = [
    { value: 'X_LIKE', label: 'X Like' },
    { value: 'X_COMMENT', label: 'X Comment' },
    { value: 'X_SHARE', label: 'X Share' },
    { value: 'X_SPACE_HOST', label: 'X Space Host' },
    { value: 'X_QUOTE', label: 'X Quote' },
    { value: 'X_RETWEET', label: 'X Retweet' },
    { value: 'X_TWEET', label: 'X Tweet' },
    { value: 'X_CUSTOM', label: 'X Custom' },
  ]

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">
            {subtask.id ? "Edit Sub-task" : "Add Sub-task"}
          </h2>
          <button onClick={onClose} className="admin-modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-field">
            <label htmlFor="subtask-type" className="admin-form-label">
              Sub-task Type *
            </label>
            <select
              id="subtask-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="admin-form-input"
              required
            >
              {SUB_TASK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-form-field">
            <label htmlFor="subtask-title" className="admin-form-label">
              Sub-task Name *
            </label>
            <input
              type="text"
              id="subtask-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="subtask-description" className="admin-form-label">
              Description
            </label>
            <textarea
              id="subtask-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="admin-form-textarea"
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="subtask-xp" className="admin-form-label">
              XP Reward *
            </label>
            <input
              type="number"
              id="subtask-xp"
              name="xpReward"
              value={formData.xpReward}
              onChange={handleChange}
              min="1"
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-field">
            <label htmlFor="subtask-link" className="admin-form-label">
              Link URL
            </label>
            <input
              type="url"
              id="subtask-link"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="admin-form-input"
              placeholder="https://..."
            />
          </div>

          <div className="admin-modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {subtask.id ? "Save Changes" : "Add Sub-task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
