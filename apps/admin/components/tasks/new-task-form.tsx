"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save,
  Target,
  Award,
  FileText,
  Loader2,
  Shield,
  CheckSquare,
  Plus,
  X,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

// Constants
const UPLOAD_PROOF_SUBTASK_ID = 'upload-proof-default'

interface SubTask {
  id: string
  title: string
  link: string
  xpReward: number
  order: number
  isUploadProof?: boolean
}

interface Campaign {
  id: string
  name: string
  status: string
}

interface NewTaskFormProps {
  campaigns: Campaign[]
  userId: string
}

export default function NewTaskForm({ campaigns }: NewTaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    campaignId: "",
    name: "",
    description: "",
    category: "SOCIAL_ENGAGEMENT" as const,
    xpReward: "100",
    verificationMethod: "MANUAL" as const,
    requirements: "",
    status: "draft" as const,
  })

  // Subtasks state
  const [subTasks, setSubTasks] = useState<SubTask[]>([])

  // AUTO-ADD Upload Proof Subtask on Mount
  useEffect(() => {
    if (subTasks.length === 0) {
      setSubTasks([
        {
          id: UPLOAD_PROOF_SUBTASK_ID,
          title: 'Upload proof/media for this task',
          link: '',
          xpReward: 0,
          order: 0,
          isUploadProof: true
        }
      ])
    }
  }, []) // Run only once on mount

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  // Subtask management functions
  const addSubTask = () => {
    // Find the upload proof subtask
    const uploadProofIndex = subTasks.findIndex(st => st.isUploadProof)
    
    const newSubTask: SubTask = {
      id: crypto.randomUUID(),
      title: '',
      link: '',
      xpReward: 0,
      order: subTasks.length - 1, // Insert before upload proof
      isUploadProof: false
    }
    
    if (uploadProofIndex !== -1) {
      // Insert before upload proof subtask
      const updatedSubTasks = [...subTasks]
      updatedSubTasks.splice(uploadProofIndex, 0, newSubTask)
      
      // Update order for all subtasks
      const reorderedSubTasks = updatedSubTasks.map((st, index) => ({
        ...st,
        order: index
      }))
      
      setSubTasks(reorderedSubTasks)
    } else {
      // If upload proof doesn't exist (shouldn't happen), just add normally
      setSubTasks([...subTasks, newSubTask])
    }
  }

  const updateSubTask = (index: number, field: keyof SubTask, value: string | number) => {
    // Prevent editing upload proof subtask
    if (subTasks[index].isUploadProof) {
      return
    }
    const updatedSubTasks = [...subTasks]
    updatedSubTasks[index] = { ...updatedSubTasks[index], [field]: value }
    setSubTasks(updatedSubTasks)
  }

  const removeSubTask = (index: number) => {
    // Prevent deletion of upload proof subtask
    if (subTasks[index].isUploadProof) {
      alert('The upload proof subtask cannot be removed')
      return
    }
    
    const updatedSubTasks = subTasks.filter((_, i) => i !== index)
    
    // Update order
    const reorderedSubTasks = updatedSubTasks.map((st, idx) => ({
      ...st,
      order: idx
    }))
    
    setSubTasks(reorderedSubTasks)
  }

  const validateSubTasks = (): string[] => {
    const errors: string[] = []

    subTasks.forEach((subTask, index) => {
      // Check title is not empty
      if (!subTask.title.trim()) {
        errors.push(`Subtask ${index + 1}: Title is required`)
      }

      // Validate XP reward is non-negative
      if (subTask.xpReward < 0) {
        errors.push(`Subtask ${index + 1}: XP reward cannot be negative`)
      }
    })

    return errors
  }

  const validateForm = () => {
    console.log("🔍 Validating form...")
    console.log("🔍 Campaign ID:", formData.campaignId)
    console.log("🔍 Name:", formData.name)
    console.log("🔍 Description:", formData.description)
    console.log("🔍 XP Reward:", formData.xpReward)
    
    if (!formData.campaignId) {
      console.error("❌ Validation failed: No campaign selected")
      setError("Please select a campaign")
      return false
    }
    if (!formData.name.trim()) {
      console.error("❌ Validation failed: No name")
      setError("Task name is required")
      return false
    }
    if (!formData.description.trim()) {
      console.error("❌ Validation failed: No description")
      setError("Description is required")
      return false
    }
    if (!formData.xpReward || parseInt(formData.xpReward) <= 0) {
      console.error("❌ Validation failed: Invalid XP reward")
      setError("XP reward must be greater than 0")
      return false
    }

    // Validate subtasks
    if (subTasks.length > 0) {
      const subtaskErrors = validateSubTasks()
      if (subtaskErrors.length > 0) {
        console.error("❌ Validation failed: Subtask errors:", subtaskErrors)
        setError(subtaskErrors.join('\n'))
        return false
      }
    }

    console.log("✅ Validation passed!")
    return true
  }

  const handleSubmit = async (statusOverride?: "draft" | "active") => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setError("")

    try {
      // Parse requirements JSON if provided
      let requirementsData = null
      if (formData.requirements.trim()) {
        try {
          requirementsData = JSON.parse(formData.requirements)
        } catch {
          setError("Invalid JSON format in requirements")
          setIsSubmitting(false)
          return
        }
      }

      // Prepare task data
      const taskData = {
        campaignId: formData.campaignId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        xpReward: parseInt(formData.xpReward),
        verificationMethod: formData.verificationMethod,
        requirements: requirementsData,
        status: statusOverride || formData.status,
        subTasks: subTasks.map((subTask, index) => ({
          title: subTask.title.trim(),
          link: subTask.link?.trim() || null,
          xpReward: parseInt(String(subTask.xpReward)) || 0,
          order: index,
          isUploadProof: subTask.isUploadProof || false
        }))
      }

      console.log("📤 Submitting task:", {
        name: taskData.name,
        campaign: taskData.campaignId,
        subtaskCount: taskData.subTasks.length,
        status: taskData.status
      })

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("❌ Task creation failed:", data)
        throw new Error(data.error || "Failed to create task")
      }

      console.log("✅ Task created successfully:", data)

      // Redirect to tasks list
      router.push("/tasks")
      router.refresh()
    } catch (err) {
      console.error("❌ Submit error:", err)
      setError(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit("draft")
  }

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔵 Create Task button clicked")
    console.log("🔵 Form data:", formData)
    console.log("🔵 Subtasks:", subTasks)
    console.log("🔵 Campaigns available:", campaigns.length)
    console.log("🔵 Is submitting:", isSubmitting)
    handleSubmit("active")
  }

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/tasks"
              className="p-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New Task
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                Add a new task to a campaign
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--status-error-alpha)',
                border: '1px solid var(--status-error)',
              }}
            >
              <p style={{ color: 'var(--status-error)' }}>{error}</p>
            </div>
          )}

          {/* Campaign Selection Warning */}
          {campaigns.length === 0 && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--status-warning-alpha)',
                border: '1px solid var(--status-warning)',
              }}
            >
              <p style={{ color: 'var(--status-warning)' }}>
                No active or draft campaigns available. Please create a campaign first.
              </p>
              <Link href="/campaigns/new" className="btn btn-primary mt-3 inline-flex">
                Create Campaign
              </Link>
            </div>
          )}

          {/* Form */}
          <form className="space-y-8">
            {/* Campaign Selection */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--interactive-primary-alpha)' }}
                >
                  <Target size={20} style={{ color: 'var(--interactive-primary)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Campaign
                </h2>
              </div>

              <div>
                <label
                  htmlFor="campaignId"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Select Campaign *
                </label>
                <select
                  id="campaignId"
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  required
                  disabled={campaigns.length === 0}
                >
                  <option value="">Choose a campaign...</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.status})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Tasks are linked to campaigns and inherit their lifecycle
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--status-info-alpha)' }}
                >
                  <FileText size={20} style={{ color: 'var(--status-info)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Basic Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Task Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="Enter task name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg transition-colors resize-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="Describe what users need to do"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="SOCIAL_ENGAGEMENT">👥 Social Engagement</option>
                      <option value="CONTENT_CREATION">✍️ Content Creation</option>
                      <option value="COMMUNITY_BUILDING">🏘️ Community Building</option>
                      <option value="REFERRAL">🔗 Referral</option>
                      <option value="CUSTOM">⚙️ Custom</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Status *
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards & Verification */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--status-success-alpha)' }}
                >
                  <Award size={20} style={{ color: 'var(--status-success)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Rewards & Verification
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="xpReward"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    XP Reward *
                  </label>
                  <input
                    type="number"
                    id="xpReward"
                    name="xpReward"
                    value={formData.xpReward}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="100"
                    required
                  />
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Experience points awarded on completion
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="verificationMethod"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Verification Method *
                  </label>
                  <select
                    id="verificationMethod"
                    name="verificationMethod"
                    value={formData.verificationMethod}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="MANUAL">Manual Review</option>
                    <option value="AI_AUTO">AI Automatic</option>
                    <option value="HYBRID">Hybrid (AI + Manual)</option>
                  </select>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    How submissions will be verified
                  </p>
                </div>
              </div>
            </div>

            {/* Subtasks */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--interactive-primary-alpha)' }}
                  >
                    <CheckSquare size={20} style={{ color: 'var(--interactive-primary)' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Subtasks (Optional)
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Break down the task into smaller steps
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addSubTask}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Subtask
                </button>
              </div>

              {subTasks.length > 0 ? (
                <div className="space-y-3">
                  {subTasks.map((subTask, index) => (
                    <div
                      key={subTask.id}
                      className="flex items-start gap-3 p-4 rounded-lg transition-all"
                      style={{
                        backgroundColor: subTask.isUploadProof ? 'var(--interactive-primary-alpha)' : 'var(--bg-primary)',
                        border: subTask.isUploadProof ? '1px solid var(--interactive-primary)' : '1px solid var(--border-default)',
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
                        style={{
                          backgroundColor: subTask.isUploadProof ? 'var(--interactive-primary)' : 'var(--bg-surface)',
                          color: subTask.isUploadProof ? 'white' : 'var(--text-secondary)',
                        }}
                      >
                        {index + 1}
                      </div>

                      <div className="flex-1 space-y-3">
                        {/* Title Input */}
                        <div>
                          <label 
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Subtask Title *
                            {subTask.isUploadProof && (
                              <span className="ml-2 text-xs" style={{ color: 'var(--interactive-primary)' }}>
                                (Auto-generated)
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Follow us on Twitter"
                            value={subTask.title}
                            onChange={(e) => updateSubTask(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            style={{
                              backgroundColor: subTask.isUploadProof ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                              border: subTask.isUploadProof ? '1px solid var(--interactive-primary)' : '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                              cursor: subTask.isUploadProof ? 'not-allowed' : 'text',
                              opacity: subTask.isUploadProof ? 0.7 : 1,
                            }}
                            required
                            readOnly={subTask.isUploadProof}
                          />
                        </div>

                        {/* Link Input - Only for regular subtasks */}
                        {!subTask.isUploadProof && (
                          <div>
                            <label 
                              className="block text-sm font-medium mb-1 flex items-center gap-2"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <svg className="h-4 w-4" style={{ color: 'var(--interactive-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Link URL
                            </label>
                            <input
                              type="url"
                              value={subTask.link || ''}
                              onChange={(e) => updateSubTask(index, 'link', e.target.value)}
                              placeholder="https://twitter.com/your_handle"
                              className="w-full px-3 py-2 rounded-lg text-sm"
                              style={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)',
                              }}
                            />
                            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                              Add a reference link (e.g., social media profile, content URL)
                            </p>
                          </div>
                        )}

                        {/* XP Reward Input */}
                        <div>
                          <label 
                            className="block text-sm font-medium mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            XP Reward
                          </label>
                          <input
                            type="number"
                            placeholder="10"
                            value={subTask.xpReward || ''}
                            onChange={(e) => updateSubTask(index, 'xpReward', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-lg text-sm"
                            min="0"
                            style={{
                              backgroundColor: subTask.isUploadProof ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                              border: subTask.isUploadProof ? '1px solid var(--interactive-primary)' : '1px solid var(--border-default)',
                              color: 'var(--text-primary)',
                              cursor: subTask.isUploadProof ? 'not-allowed' : 'text',
                              opacity: subTask.isUploadProof ? 0.7 : 1,
                            }}
                            readOnly={subTask.isUploadProof}
                          />
                        </div>

                        {subTask.isUploadProof && (
                          <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                            This subtask is automatically added for ambassadors to upload proof of task completion
                          </p>
                        )}
                      </div>

                      {/* Delete Button - Hidden for upload proof */}
                      {!subTask.isUploadProof && (
                        <button
                          type="button"
                          onClick={() => removeSubTask(index)}
                          className="flex-shrink-0 p-2 rounded hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--status-error)' }}
                          title="Remove subtask"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-8 rounded-lg"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px dashed var(--border-default)',
                  }}
                >
                  <CheckSquare
                    size={32}
                    style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }}
                  />
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Upload proof subtask added automatically
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Click "Add Subtask" to add more steps
                  </p>
                </div>
              )}
            </div>

            {/* Requirements (Advanced) */}
            <div
              className="card"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--status-warning-alpha)' }}
                >
                  <Shield size={20} style={{ color: 'var(--status-warning)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Requirements (Optional)
                </h2>
              </div>

              <div>
                <label
                  htmlFor="requirements"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Requirements JSON
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-2 rounded-lg transition-colors resize-none font-mono text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder='{"minFollowers": 1000, "platform": "twitter"}'
                />
                <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Optional JSON data for task requirements (e.g., follower count, platform, etc.)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Link
                href="/tasks"
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting || campaigns.length === 0}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  opacity: isSubmitting || campaigns.length === 0 ? 0.6 : 1,
                  cursor: isSubmitting || campaigns.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save as Draft
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || campaigns.length === 0}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--interactive-primary)',
                  color: 'white',
                  opacity: isSubmitting || campaigns.length === 0 ? 0.6 : 1,
                  cursor: isSubmitting || campaigns.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
