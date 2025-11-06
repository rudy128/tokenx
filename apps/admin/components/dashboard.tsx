"use client"

import { Shield, Users, BarChart3, Settings, Briefcase } from "lucide-react"
import AdminLayout from "./admin-layout"

interface AdminDashboardProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Welcome back, {user.name?.split(' ')[0] || "Admin"}! 👋
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Here&apos;s what&apos;s happening with your platform today.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<Users size={24} />}
              title="Total Ambassadors"
              value="Coming Soon"
              subtitle="Active users"
              color="var(--interactive-primary)"
            />
            <StatCard
              icon={<Briefcase size={24} />}
              title="Active Campaigns"
              value="Coming Soon"
              subtitle="Running campaigns"
              color="var(--status-success)"
            />
            <StatCard
              icon={<BarChart3 size={24} />}
              title="Tasks Completed"
              value="Coming Soon"
              subtitle="This month"
              color="var(--status-warning)"
            />
            <StatCard
              icon={<Settings size={24} />}
              title="System Status"
              value="Operational"
              subtitle="All systems running"
              color="var(--status-info)"
            />
          </div>

          {/* Info Card */}
          <div 
            className="card"
            style={{ 
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--interactive-primary-alpha)' }}
              >
                <Shield size={24} style={{ color: 'var(--interactive-primary)' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Admin Dashboard Under Development
                </h3>
                <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
                  The admin dashboard is currently being built. Soon you&apos;ll be able to:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--interactive-primary)' }}></span>
                    Manage ambassadors and user roles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--interactive-primary)' }}></span>
                    Create and monitor campaigns
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--interactive-primary)' }}></span>
                    Review task submissions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--interactive-primary)' }}></span>
                    View analytics and reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--interactive-primary)' }}></span>
                    Configure platform settings
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
  color: string
}

function StatCard({ icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div 
      className="card"
      style={{ 
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        transition: 'all 0.2s ease'
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
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>
        {title}
      </h3>
      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {subtitle}
      </p>
    </div>
  )
}
