"use client"

import AdminHeader from "./admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      <AdminHeader />
      <main>
        {children}
      </main>
    </div>
  )
}
