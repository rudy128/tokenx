"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter, 
  Calendar, 
  Target, 
  MoreVertical,
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
  User: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    CampaignParticipation: number
    Task: number
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
      <div style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Campaigns
              </h1>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                Manage and monitor all ambassador campaigns
              </p>
            </div>
            <div className="flex items-center gap-3">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard label="Total Campaigns" value={stats.total} color="var(--interactive-primary)" />
            <StatCard label="Active" value={stats.active} color="var(--status-success)" />
            <StatCard label="Draft" value={stats.draft} color="var(--status-warning)" />
            <StatCard label="Completed" value={stats.completed} color="var(--status-info)" />
            <StatCard label="Participants" value={stats.totalParticipants} color="var(--text-primary)" />
            <StatCard label="Tasks" value={stats.totalTasks} color="var(--text-primary)" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]" style={{ position: 'relative' }}>
              <Search 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)'
                }} 
              />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '40px' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
              style={{ width: '200px' }}
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
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {filteredCampaigns.length === 0 ? (
            <div 
              className="text-center py-12 rounded-lg border-2 border-dashed"
              style={{ 
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <Target size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No campaigns found
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || statusFilter !== "ALL" 
                  ? "Try adjusting your filters" 
                  : "Create your first campaign to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div 
      className="rounded-lg p-4 border"
      style={{ 
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)'
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE': return 'var(--status-success)'
      case 'DRAFT': return 'var(--status-warning)'
      case 'PAUSED': return 'var(--status-info)'
      case 'COMPLETED': return 'var(--text-tertiary)'
      case 'CANCELLED': return 'var(--status-error)'
      default: return 'var(--text-tertiary)'
    }
  }

  const getStatusBg = (status: Campaign['status']) => {
    switch (status) {
      case 'ACTIVE': return 'var(--status-success-bg)'
      case 'DRAFT': return 'var(--status-warning-bg)'
      case 'PAUSED': return 'var(--status-info-bg)'
      case 'COMPLETED': return 'var(--bg-subtle)'
      case 'CANCELLED': return 'var(--status-error-bg)'
      default: return 'var(--bg-subtle)'
    }
  }

  const isActive = new Date() >= new Date(campaign.startDate) && new Date() <= new Date(campaign.endDate)
  const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div 
      className="card group"
      style={{ 
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {campaign.name}
          </h3>
          <span 
            className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
            style={{ 
              backgroundColor: getStatusBg(campaign.status),
              color: getStatusColor(campaign.status)
            }}
          >
            {campaign.status}
          </span>
        </div>
        <button className="btn btn-ghost p-2" style={{ minWidth: 'unset' }}>
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Description */}
      <p 
        className="text-sm mb-4 line-clamp-2" 
        style={{ color: 'var(--text-secondary)' }}
      >
        {campaign.description}
      </p>

      {/* Dates */}
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <Calendar size={14} />
        <span>
          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
        </span>
      </div>

      {isActive && daysLeft > 0 && (
        <div 
          className="text-xs font-medium mb-3"
          style={{ color: 'var(--status-warning)' }}
        >
          🔥 {daysLeft} days remaining
        </div>
      )}

      {/* Stats */}
      <div 
        className="grid grid-cols-3 gap-3 pt-3 mb-4 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Participants</p>
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {campaign._count.CampaignParticipation}
            {campaign.participantLimit && `/${campaign.participantLimit}`}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tasks</p>
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {campaign._count.Task}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Rewards</p>
          <p className="font-bold text-sm" style={{ color: 'var(--status-success)' }}>
            {campaign.rewardPool} {campaign.rewardToken}
          </p>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span>By {campaign.User.name || campaign.User.email}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <Link 
          href={`/campaigns/${campaign.id}`}
          className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          <Eye size={16} />
          View
        </Link>
        <Link 
          href={`/campaigns/${campaign.id}/edit`}
          className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          <Edit size={16} />
          Edit
        </Link>
      </div>
    </div>
  )
}
