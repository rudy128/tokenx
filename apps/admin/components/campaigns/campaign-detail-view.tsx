"use client"

import { useState } from "react"
import { 
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Coins,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminLayout from "../admin-layout"
import { formatDate } from "@/lib/utils"

type Task = {
  id: string
  name: string
  description: string
  xpReward: number
  category: string
  status: string
  createdAt: Date
  _count: {
    TaskSubmission: number
  }
}

type Participant = {
  id: string
  userId: string
  joinedAt: Date
  User: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

type Campaign = {
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
  Task: Task[]
  CampaignParticipation: Participant[]
  _count: {
    CampaignParticipation: number
    Task: number
  }
}

interface CampaignDetailViewProps {
  campaign: Campaign
}

export default function CampaignDetailView({ campaign }: CampaignDetailViewProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete campaign")
      }

      router.push("/campaigns")
      router.refresh()
    } catch (error) {
      console.error("Error deleting campaign:", error)
      alert("Failed to delete campaign. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
      ACTIVE: "bg-green-100 text-green-700 border-green-300",
      PAUSED: "bg-yellow-100 text-yellow-700 border-yellow-300",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-300",
      CANCELLED: "bg-red-100 text-red-700 border-red-300",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
        {status}
      </span>
    )
  }

  const totalSubmissions = campaign.Task.reduce((sum, task) => sum + task._count.TaskSubmission, 0)

  return (
    <AdminLayout>
      <div className="admin-campaign-detail-main">
        {/* Header */}
        <div className="admin-campaign-detail-header">
          <Link href="/campaigns" className="btn btn-secondary flex items-center gap-2 mb-4">
            <ArrowLeft size={18} />
            Back to Campaigns
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="admin-campaign-detail-title">{campaign.name}</h1>
                {getStatusBadge(campaign.status)}
              </div>
              <p className="admin-campaign-detail-subtitle">{campaign.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href={`/campaigns/${campaign.id}/edit`}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Edit size={18} />
                Edit
              </Link>
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
        </div>

        {/* Stats Grid */}
        <div className="admin-campaign-stats-grid">
          <div className="admin-campaign-stat-card">
            <div className="admin-campaign-stat-icon bg-blue-100">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="admin-campaign-stat-content">
              <div className="admin-campaign-stat-value">{campaign._count.CampaignParticipation}</div>
              <div className="admin-campaign-stat-label">Participants</div>
              {campaign.participantLimit && (
                <div className="admin-campaign-stat-meta">
                  of {campaign.participantLimit} limit
                </div>
              )}
            </div>
          </div>

          <div className="admin-campaign-stat-card">
            <div className="admin-campaign-stat-icon bg-purple-100">
              <Target className="text-purple-600" size={24} />
            </div>
            <div className="admin-campaign-stat-content">
              <div className="admin-campaign-stat-value">{campaign._count.Task}</div>
              <div className="admin-campaign-stat-label">Tasks</div>
              <div className="admin-campaign-stat-meta">{totalSubmissions} submissions</div>
            </div>
          </div>

          <div className="admin-campaign-stat-card">
            <div className="admin-campaign-stat-icon bg-green-100">
              <Coins className="text-green-600" size={24} />
            </div>
            <div className="admin-campaign-stat-content">
              <div className="admin-campaign-stat-value">{campaign.rewardPool}</div>
              <div className="admin-campaign-stat-label">Reward Pool</div>
              <div className="admin-campaign-stat-meta">{campaign.rewardToken}</div>
            </div>
          </div>

          <div className="admin-campaign-stat-card">
            <div className="admin-campaign-stat-icon bg-amber-100">
              <Calendar className="text-amber-600" size={24} />
            </div>
            <div className="admin-campaign-stat-content">
              <div className="admin-campaign-stat-value">
                {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))}d
              </div>
              <div className="admin-campaign-stat-label">Duration</div>
              <div className="admin-campaign-stat-meta">
                {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="admin-campaign-content-grid">
          {/* Tasks Section */}
          <div className="admin-campaign-section">
            <div className="admin-campaign-section-header">
              <h2 className="admin-campaign-section-title">
                <Target size={20} />
                Tasks ({campaign.Task.length})
              </h2>
              <Link href={`/tasks/new?campaignId=${campaign.id}`} className="btn btn-sm btn-primary">
                Add Task
              </Link>
            </div>

            <div className="admin-campaign-section-content">
              {campaign.Task.length === 0 ? (
                <div className="admin-campaign-empty-state">
                  <FileText size={48} className="text-gray-400 mb-3" />
                  <p className="text-gray-600">No tasks yet</p>
                  <Link href={`/tasks/new?campaignId=${campaign.id}`} className="btn btn-sm btn-primary mt-3">
                    Create First Task
                  </Link>
                </div>
              ) : (
                <div className="admin-campaign-list">
                  {campaign.Task.map((task) => (
                    <div key={task.id} className="admin-campaign-list-item">
                      <div className="admin-campaign-list-item-content">
                        <div className="admin-campaign-list-item-header">
                          <h3 className="admin-campaign-list-item-title">{task.name}</h3>
                          <span className={`admin-campaign-list-item-badge ${
                            task.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="admin-campaign-list-item-description">{task.description}</p>
                        <div className="admin-campaign-list-item-meta">
                          <span className="flex items-center gap-1">
                            <Award size={14} />
                            {task.xpReward} XP
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {task.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {task._count.TaskSubmission} submissions
                          </span>
                        </div>
                      </div>
                      <Link 
                        href={`/tasks/${task.id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Participants Section */}
          <div className="admin-campaign-section">
            <div className="admin-campaign-section-header">
              <h2 className="admin-campaign-section-title">
                <Users size={20} />
                Participants ({campaign.CampaignParticipation.length})
              </h2>
            </div>

            <div className="admin-campaign-section-content">
              {campaign.CampaignParticipation.length === 0 ? (
                <div className="admin-campaign-empty-state">
                  <Users size={48} className="text-gray-400 mb-3" />
                  <p className="text-gray-600">No participants yet</p>
                </div>
              ) : (
                <div className="admin-campaign-list">
                  {campaign.CampaignParticipation.map((participation) => (
                    <div key={participation.id} className="admin-campaign-list-item">
                      <div className="flex items-center gap-3">
                        {participation.User.image ? (
                          <img 
                            src={participation.User.image} 
                            alt={participation.User.name || "User"} 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users size={20} className="text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="admin-campaign-list-item-title">
                            {participation.User.name || "Anonymous"}
                          </h3>
                          <p className="admin-campaign-list-item-description text-sm">
                            {participation.User.email}
                          </p>
                          <p className="admin-campaign-list-item-meta text-xs">
                            Joined {formatDate(participation.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Info Section */}
        <div className="admin-campaign-info-section">
          <h2 className="admin-campaign-section-title mb-4">Campaign Information</h2>
          <div className="admin-campaign-info-grid">
            <div className="admin-campaign-info-item">
              <span className="admin-campaign-info-label">Created By</span>
              <span className="admin-campaign-info-value">
                {campaign.User.name || campaign.User.email}
              </span>
            </div>
            <div className="admin-campaign-info-item">
              <span className="admin-campaign-info-label">Created At</span>
              <span className="admin-campaign-info-value">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="admin-campaign-info-item">
              <span className="admin-campaign-info-label">Last Updated</span>
              <span className="admin-campaign-info-value">{formatDate(campaign.updatedAt)}</span>
            </div>
            {campaign.eligibilityCriteria && (
              <div className="admin-campaign-info-item">
                <span className="admin-campaign-info-label">Eligibility Criteria</span>
                <span className="admin-campaign-info-value">{campaign.eligibilityCriteria}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
