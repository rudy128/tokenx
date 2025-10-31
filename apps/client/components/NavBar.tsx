"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu"
import { Users, LayoutDashboard, Trophy, Zap, Calendar } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks/daily", label: "Daily Tasks", icon: Calendar },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/rewards", label: "Rewards", icon: Zap },
]

export function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [blurActive, setBlurActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10
      setBlurActive(scrolled)
    }
    
    // Initial check
    handleScroll()
    
    // Add scroll listener with throttling for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener("scroll", throttledScroll, { passive: true })
    return () => window.removeEventListener("scroll", throttledScroll)
  }, [])

  const isActivePath = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    if (href === "/dashboard/campaigns") {
      // Handle both /campaigns redirect and /dashboard/campaigns routes
      return pathname === "/campaigns" || pathname.startsWith("/dashboard/campaigns")
    }
    if (href === "/leaderboard") {
      // Handle both /leaderboard redirect and /dashboard/leaderboard routes
      return pathname === "/leaderboard" || pathname.startsWith("/dashboard/leaderboard")
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Top spacer that matches navbar background */}
      <div className={`navbar-top-spacer${blurActive ? " blur-active" : ""}`} />
      
      <nav className={`tokenx-navbar${blurActive ? " blur-active" : ""}`}>
        <div 
          className="navbar-content"
          style={{
            maxWidth: '80rem',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '4rem',
            padding: '0 1rem 0 0rem',
            minHeight: '4rem',
            gap: '4rem'
          }}
        >
        {/* Logo - Far Left Side */}
        <Link 
          href="/dashboard" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            flexShrink: 0,
            marginRight: 'auto',
            marginLeft: '-1rem'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '2rem',
              width: '2rem',
              backgroundColor: 'var(--interactive-primary)',
              borderRadius: '0.5rem'
            }}
          >
            <Zap 
              style={{
                height: '1.25rem',
                width: '1.25rem',
                color: 'var(--text-inverse)'
              }}
            />
          </div>
          <span 
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)'
            }}
          >
            TokenX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}
          className="hidden md:flex"
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isActivePath(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-brand)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--interactive-secondary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.25s var(--transition-base), color 0.25s var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--interactive-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon style={{ height: '1rem', width: '1rem' }} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* User Menu - Right Side */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0
          }}
        >
          <AnimatedThemeToggler />
          {status === "loading" ? (
            <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : status === "unauthenticated" ? (
            <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
              Not signed in
            </div>
          ) : session?.user ? (
            <DashboardProfileMenu
              name={session.user.name || null}
              email={session.user.email || 'Guest'}
              image={session.user.image || null}
              tier="BRONZE TIER"
            />
          ) : (
            <div style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>
              No user data
            </div>
          )}
        </div>
        </div>
      </nav>
    </>
  )
}

export default NavBar