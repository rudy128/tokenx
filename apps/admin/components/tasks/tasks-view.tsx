"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Plus,
  Edit,
  Eye,
  Target,
  Users,
  Award,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react"
import Link from "next/link"
import AdminLayout from "../admin-layout"

type Task = {
  id: string
  campaignId: string
  name: string
  description: string | null
  category: "SOCIAL_ENGAGEMENT" | "CONTENT_CREATION" | "COMMUNITY_BUILDING" | "REFERRAL" | "CUSTOM"
  xpReward: number
  verificationMethod: "AI_AUTO" | "MANUAL" | "HYBRID"
  requirements: unknown
  createdAt: Date
  updatedAt: Date
  status: "draft" | "active" | "archived" | "completed" | "cancelled"
  Campaign: {
    id: string
    name: string
    status: string
  }
  _count: {
    TaskSubmissions: number
  }
}

interface TasksViewProps {
  tasks: Task[]
}

export default function TasksView({ tasks }: TasksViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.Campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "ALL" || task.status === statusFilter.toLowerCase()
      const matchesCategory = categoryFilter === "ALL" || task.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [tasks, searchQuery, statusFilter, categoryFilter])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      active: tasks.filter(t => t.status === "active").length,
      draft: tasks.filter(t => t.status === "draft").length,
      archived: tasks.filter(t => t.status === "archived").length,
      totalSubmissions: tasks.reduce((acc, t) => acc + t._count.TaskSubmissions, 0),
    }
  }, [tasks])

  return (
    <AdminLayout>
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Tasks Management
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Manage tasks across all campaigns
              </p>
            </div>
            <Link
              href="/tasks/new"
              className="btn btn-primary"
            >
              <Plus size={20} />
              New Task
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={<Target size={20} />}
              label="Total Tasks"
              value={stats.total.toString()}
              color="var(--interactive-primary)"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              label="Active"
              value={stats.active.toString()}
              color="var(--status-success)"
            />
            <StatCard
              icon={<Clock size={20} />}
              label="Draft"
              value={stats.draft.toString()}
              color="var(--status-warning)"
            />
            <StatCard
              icon={<Archive size={20} />}
              label="Archived"
              value={stats.archived.toString()}
              color="var(--text-tertiary)"
            />
            <StatCard
              icon={<Users size={20} />}
              label="Submissions"
              value={stats.totalSubmissions.toString()}
              color="var(--status-info)"
            />
          </div>

          {/* Filters */}
          <div
            className="card mb-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="flex flex-col md:flex-row gap-4">
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
                  placeholder="Search tasks..."
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
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
                style={{ width: '200px' }}
              >
                <option value="ALL">All Categories</option>
                <option value="SOCIAL_ENGAGEMENT">Social Engagement</option>
                <option value="CONTENT_CREATION">Content Creation</option>
                <option value="COMMUNITY_BUILDING">Community Building</option>
                <option value="REFERRAL">Referral</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div
              className="card text-center py-12"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
              }}
            >
              <Target size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                No tasks found
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || statusFilter !== "ALL" || categoryFilter !== "ALL"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
              {!searchQuery && statusFilter === "ALL" && categoryFilter === "ALL" && (
                <Link href="/tasks/new" className="btn btn-primary mt-4 inline-flex">
                  <Plus size={20} />
                  Create Task
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-lg"
          style={{ 
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: Task
}

function TaskCard({ task }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "var(--status-success)"
      case "draft":
        return "var(--status-warning)"
      case "archived":
        return "var(--text-tertiary)"
      default:
        return "var(--text-secondary)"
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active":
        return "var(--status-success-alpha)"
      case "draft":
        return "var(--status-warning-alpha)"
      case "archived":
        return "var(--bg-tertiary)"
      default:
        return "var(--bg-secondary)"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "SOCIAL_ENGAGEMENT":
        return "👥"
      case "CONTENT_CREATION":
        return "✍️"
      case "COMMUNITY_BUILDING":
        return "🏘️"
      case "REFERRAL":
        return "🔗"
      case "CUSTOM":
        return "⚙️"
      default:
        return "📋"
    }
  }

  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--border-default)'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getCategoryIcon(task.category)}</span>
            <span 
              className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
              style={{ 
                backgroundColor: getStatusBg(task.status),
                color: getStatusColor(task.status)
              }}
            >
              {task.status.toUpperCase()}
            </span>
          </div>
          <Link href={`/tasks/${task.id}`} className="hover:underline">
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {task.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/tasks/${task.id}`}
            className="btn btn-ghost p-2"
            style={{ minWidth: 'unset' }}
            title="View submissions"
          >
            <Eye size={18} />
          </Link>
          <Link
            href={`/tasks/${task.id}/edit`}
            className="btn btn-ghost p-2"
            style={{ minWidth: 'unset' }}
            title="Edit task"
          >
            <Edit size={18} />
          </Link>
        </div>
      </div>

      {/* Description */}
      <p 
        className="text-sm mb-3 line-clamp-2" 
        style={{ color: 'var(--text-secondary)' }}
      >
        {task.description}
      </p>

      {/* Campaign */}
      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <Target size={14} />
        <span>{task.Campaign.name}</span>
      </div>

      {/* Category */}
      <div className="mb-3">
        <span 
          className="inline-block px-2 py-1 rounded-md text-xs font-medium"
          style={{ 
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)'
          }}
        >
          {formatCategoryName(task.category)}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-2">
          <Award size={16} style={{ color: 'var(--status-warning)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {task.xpReward} XP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} style={{ color: 'var(--status-info)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {task._count.TaskSubmissions} submissions
          </span>
        </div>
      </div>

      {/* Verification Method */}
      <div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Verification: {task.verificationMethod.replace("_", " ")}
      </div>
    </div>
  )
}
