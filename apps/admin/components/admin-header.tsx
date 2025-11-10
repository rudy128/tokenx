"use client"

import { signOut, useSession } from "next-auth/react"
import { Shield, LogOut, LayoutDashboard, Briefcase, Users, FileText, Settings, CheckSquare } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/sign-in" })
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/campaigns", label: "Campaigns", icon: Briefcase },
    { href: "/users", label: "Users", icon: Users },
    { href: "/submissions", label: "Submissions", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const isActive = (href: string) => pathname === href

  return (
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
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {session?.user && (
            <>
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {session.user.name || "Admin"}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {session.user.email}
                  </p>
                </div>
                {session.user.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "Admin"} 
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div 
                    className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                    style={{ backgroundColor: 'var(--interactive-primary)', color: 'var(--text-on-primary)' }}
                  >
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || "A"}
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
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-0">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all"
                style={{
                  color: active ? 'var(--interactive-primary)' : 'var(--text-secondary)',
                  backgroundColor: active ? 'var(--bg-app)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.875rem',
                  borderBottom: active ? '2px solid var(--interactive-primary)' : '2px solid transparent',
                  marginBottom: '-2px'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
