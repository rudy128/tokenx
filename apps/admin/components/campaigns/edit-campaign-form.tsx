"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

interface Campaign {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date
  participantLimit: number | null
  eligibilityCriteria: string | null
  rewardPool: number
  rewardToken: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  createdAt: Date
  updatedAt: Date
  User: {
    id: string
    name: string | null
    email: string
  }
}

interface EditCampaignFormProps {
  campaign: Campaign
  userId: string
}

export default function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  // Format dates for datetime-local input
  const formatDateForInput = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Form state - pre-filled with campaign data
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    startDate: formatDateForInput(campaign.startDate),
    endDate: formatDateForInput(campaign.endDate),
    participantLimit: campaign.participantLimit?.toString() || "",
    eligibilityCriteria: campaign.eligibilityCriteria || "",
    rewardPool: campaign.rewardPool.toString(),
    rewardToken: campaign.rewardToken,
    status: campaign.status,
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Campaign name is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (!formData.startDate) {
      setError("Start date is required")
      return false
    }
    if (!formData.endDate) {
      setError("End date is required")
      return false
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("End date must be after start date")
      return false
    }
    if (!formData.rewardPool || parseFloat(formData.rewardPool) <= 0) {
      setError("Reward pool must be greater than 0")
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
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          participantLimit: formData.participantLimit ? parseInt(formData.participantLimit) : null,
          eligibilityCriteria: formData.eligibilityCriteria.trim() || null,
          rewardPool: parseFloat(formData.rewardPool),
          rewardToken: formData.rewardToken,
          status: formData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update campaign")
      }

      // Redirect to campaigns list or detail page
      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete campaign")
      }

      // Redirect to campaigns list
      router.push("/campaigns")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign")
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-5xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/campaigns"
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
                  Edit Campaign
                </h1>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Update campaign details and settings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'var(--status-error)',
                color: 'white',
                opacity: isDeleting ? 0.6 : 1,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete Campaign
                </>
              )}
            </button>
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  style={{ backgroundColor: 'var(--interactive-primary-alpha)' }}
                >
                  <FileText size={20} style={{ color: 'var(--interactive-primary)' }} />
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
                    Campaign Name *
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
                    placeholder="Enter campaign name"
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
                    placeholder="Describe the campaign objectives and requirements"
                    required
                  />
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
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline */}
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
                  <Calendar size={20} style={{ color: 'var(--status-info)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Timeline
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Participation Settings */}
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
                  <Users size={20} style={{ color: 'var(--status-warning)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Participation Settings
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="participantLimit"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Participant Limit
                  </label>
                  <input
                    type="number"
                    id="participantLimit"
                    name="participantLimit"
                    value={formData.participantLimit}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Maximum number of participants allowed (optional)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="eligibilityCriteria"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Eligibility Criteria
                  </label>
                  <textarea
                    id="eligibilityCriteria"
                    name="eligibilityCriteria"
                    value={formData.eligibilityCriteria}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg transition-colors resize-none"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="Describe who can participate (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Rewards Configuration */}
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
                  <DollarSign size={20} style={{ color: 'var(--status-success)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Rewards Configuration
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rewardPool"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Total Reward Pool *
                  </label>
                  <input
                    type="number"
                    id="rewardPool"
                    name="rewardPool"
                    value={formData.rewardPool}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="rewardToken"
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Reward Token *
                  </label>
                  <select
                    id="rewardToken"
                    name="rewardToken"
                    value={formData.rewardToken}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="USDT">USDT</option>
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                    <option value="ETH">ETH</option>
                    <option value="BTC">BTC</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Link
                href="/campaigns"
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
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'var(--interactive-primary)',
                  color: 'white',
                  opacity: isSubmitting ? 0.6 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Campaign
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
