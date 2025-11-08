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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <main className="dashboard-main">
          {/* Welcome Section */}
          <div className="page-header">
            <div className="page-header-content">
              <div className="page-header-text">
                <h1 className="page-header-title">
                  Welcome back, {user.name?.split(' ')[0] || "Admin"}! 👋
                </h1>
                <p className="page-header-description">
                  Here&apos;s what&apos;s happening with your platform today.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="stat-cards-row">
            <div className="stat-card stat-card-primary">
              <div className="stat-card-icon">
                <Users className="h-6 w-6" />
              </div>
              <span className="stat-card-label">TOTAL AMBASSADORS</span>
              <span className="stat-card-value">Coming Soon</span>
              <span className="stat-card-meta">ACTIVE USERS</span>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-card-icon">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="stat-card-label">ACTIVE CAMPAIGNS</span>
              <span className="stat-card-value">Coming Soon</span>
              <span className="stat-card-meta">RUNNING CAMPAIGNS</span>
            </div>

            <div className="stat-card stat-card-warning">
              <div className="stat-card-icon">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="stat-card-label">TASKS COMPLETED</span>
              <span className="stat-card-value">Coming Soon</span>
              <span className="stat-card-meta">THIS MONTH</span>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-card-icon">
                <Settings className="h-6 w-6" />
              </div>
              <span className="stat-card-label">SYSTEM STATUS</span>
              <span className="stat-card-value">Operational</span>
              <span className="stat-card-meta">ALL SYSTEMS RUNNING</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="dashboard-content-grid" style={{ marginTop: 'var(--space-12)' }}>
            <div className="dashboard-section-container">
              <div className="card">
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'rgba(21, 163, 175, 0.1)',
                      borderRadius: 'var(--radius-md)'
                    }}
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
        </main>
      </div>
    </AdminLayout>
  )
}
