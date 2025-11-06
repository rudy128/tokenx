"use client"

import { signOut } from "next-auth/react"
import { Shield, LogOut, Users, BarChart3, Settings, Briefcase } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

interface AdminDashboardProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Header */}
      <header 
        className="border-b"
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          borderColor: 'var(--border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-on-primary)' }}
            >
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Admin Portal
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                TokenX Ambassador Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user.name || "Admin"}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {user.email}
                </p>
              </div>
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || "Admin"} 
                  className="w-9 h-9 rounded-full"
                />
              ) : (
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                  style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-on-primary)' }}
                >
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "A"}
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="btn btn-ghost"
              style={{ gap: '0.5rem' }}
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
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
      </main>
    </div>
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
