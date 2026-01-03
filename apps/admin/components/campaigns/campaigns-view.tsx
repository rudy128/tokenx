"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter, 
  Calendar, 
  Target, 
  Eye,
  Edit,
  Plus,
  Download,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

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
  Creator: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    CampaignParticipation: number
    Tasks: number
  }
}

interface CampaignsViewProps {
  campaigns: Campaign[]
}

export default function CampaignsView({ campaigns }: CampaignsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "ALL" || campaign.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchQuery, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter(c => c.status === "ACTIVE").length
    const draft = campaigns.filter(c => c.status === "DRAFT").length
    const completed = campaigns.filter(c => c.status === "COMPLETED").length
    const totalParticipants = campaigns.reduce((sum, c) => sum + c._count.CampaignParticipation, 0)
    const totalTasks = campaigns.reduce((sum, c) => sum + c._count.Task, 0)

    return { total, active, draft, completed, totalParticipants, totalTasks }
  }, [campaigns])

  return (
    <AdminLayout>
      <div className="admin-campaigns-main">
        {/* Header */}
        <div className="admin-campaigns-header">
          <div className="admin-campaigns-header-content">
            <div className="admin-campaigns-title-row">
              <div className="admin-campaigns-title-section">
                <h1 className="admin-campaigns-title">Campaigns</h1>
                <p className="admin-campaigns-subtitle">
                  Manage and monitor all ambassador campaigns
                </p>
              </div>
              <div className="admin-campaigns-actions">
                <button className="btn btn-secondary flex items-center gap-2">
                  <Download size={18} />
                  Export
                </button>
                <Link href="/campaigns/new" className="btn btn-primary flex items-center gap-2">
                  <Plus size={18} />
                  New Campaign
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="admin-campaigns-stats-grid">
              <div className="admin-campaigns-stat-card admin-campaigns-stat-card-primary">
                <p className="admin-campaigns-stat-label">Total Campaigns</p>
                <p className="admin-campaigns-stat-value">{stats.total}</p>
              </div>
              <div className="admin-campaigns-stat-card admin-campaigns-stat-card-success">
                <p className="admin-campaigns-stat-label">Active</p>
                <p className="admin-campaigns-stat-value">{stats.active}</p>
              </div>
              <div className="admin-campaigns-stat-card admin-campaigns-stat-card-warning">
                <p className="admin-campaigns-stat-label">Draft</p>
                <p className="admin-campaigns-stat-value">{stats.draft}</p>
              </div>
              <div className="admin-campaigns-stat-card admin-campaigns-stat-card-info">
                <p className="admin-campaigns-stat-label">Completed</p>
                <p className="admin-campaigns-stat-value">{stats.completed}</p>
              </div>
              <div className="admin-campaigns-stat-card">
                <p className="admin-campaigns-stat-label">Participants</p>
                <p className="admin-campaigns-stat-value">{stats.totalParticipants}</p>
              </div>
              <div className="admin-campaigns-stat-card">
                <p className="admin-campaigns-stat-label">Tasks</p>
                <p className="admin-campaigns-stat-value">{stats.totalTasks}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="admin-campaigns-filter-section">
              <div className="admin-campaigns-search-wrapper">
                <Search size={18} className="admin-campaigns-search-icon" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-campaigns-search-input"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-campaigns-filter-select"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button className="btn btn-secondary">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="admin-campaigns-content">
          {filteredCampaigns.length === 0 ? (
            <div className="admin-campaigns-empty-state">
              <Target className="admin-campaigns-empty-icon" />
              <h3 className="admin-campaigns-empty-title">No campaigns found</h3>
              <p className="admin-campaigns-empty-description">
                {searchQuery || statusFilter !== "ALL" 
                  ? "Try adjusting your filters" 
                  : "Create your first campaign to get started"}
              </p>
            </div>
          ) : (
            <div className="admin-campaigns-grid">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

// StatCard component removed - now using inline styles in main component

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const getStatusClass = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE': return 'admin-campaign-card-status-active'
      case 'DRAFT': return 'admin-campaign-card-status-draft'
      case 'PAUSED': return 'admin-campaign-card-status-paused'
      case 'COMPLETED': return 'admin-campaign-card-status-completed'
      case 'CANCELLED': return 'admin-campaign-card-status-cancelled'
      default: return 'admin-campaign-card-status-draft'
    }
  }

  const isActive = new Date() >= new Date(campaign.startDate) && new Date() <= new Date(campaign.endDate)
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="admin-campaign-card">
      {/* Header */}
      <div className="admin-campaign-card-header">
        <div className="admin-campaign-card-title-section">
          <h3 className="admin-campaign-card-title">{campaign.name}</h3>
          <span className={`admin-campaign-card-status ${getStatusClass(campaign.status)}`}>
            {campaign.status}
          </span>
        </div>
        <Link
          href={`/campaigns/${campaign.id}/edit`}
          className="admin-campaign-card-edit-btn"
          title="Edit campaign"
        >
          <Edit size={18} />
        </Link>
      </div>

      {/* Description */}
      <p className="admin-campaign-card-description">
        {campaign.description}
      </p>

      {/* Dates */}
      <div className="admin-campaign-card-dates">
        <Calendar className="admin-campaign-card-dates-icon" />
        <span>
          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
        </span>
      </div>

      {isActive && daysLeft > 0 && (
        <p className="admin-campaign-card-days-remaining">
          🔥 {daysLeft} days remaining
        </p>
      )}

      {/* Stats */}
      <div className="admin-campaign-card-stats">
        <div className="admin-campaign-card-stat">
          <p className="admin-campaign-card-stat-label">Participants</p>
          <p className="admin-campaign-card-stat-value">
            {campaign._count.CampaignParticipation}
            {campaign.participantLimit && `/${campaign.participantLimit}`}
          </p>
        </div>
        <div className="admin-campaign-card-stat">
          <p className="admin-campaign-card-stat-label">Tasks</p>
          <p className="admin-campaign-card-stat-value">
            {campaign._count.Task}
          </p>
        </div>
        <div className="admin-campaign-card-stat">
          <p className="admin-campaign-card-stat-label">Rewards</p>
          <p className="admin-campaign-card-stat-value admin-campaign-card-stat-value-success">
            {campaign.rewardPool} {campaign.rewardToken}
          </p>
        </div>
      </div>

      {/* Creator */}
      <div className="admin-campaign-card-creator">
        <span>By {campaign.Creator.name || campaign.Creator.email}</span>
      </div>

      {/* Actions */}
      <div className="admin-campaign-card-actions">
        <Link 
          href={`/campaigns/${campaign.id}`}
          className="admin-campaign-card-action-btn"
        >
          <Eye className="admin-campaign-card-action-icon" />
          View
        </Link>
        <Link 
          href={`/campaigns/${campaign.id}/edit`}
          className="admin-campaign-card-action-btn"
        >
          <Edit className="admin-campaign-card-action-icon" />
          Edit
        </Link>
      </div>
    </div>
  )
}
