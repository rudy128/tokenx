"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save,
  Target,
  Award,
  FileText,
  Loader2,
  Shield,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.campaignId) {
      setError("Please select a campaign")
      return false
    }
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

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: formData.campaignId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          xpReward: parseInt(formData.xpReward),
          verificationMethod: formData.verificationMethod,
          requirements: requirementsData,
          status: statusOverride || formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create task")
      }

      // Redirect to tasks list
      router.push("/tasks")
      router.refresh()
    } catch (err) {
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
