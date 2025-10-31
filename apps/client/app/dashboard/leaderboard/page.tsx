"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/NavBar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Trophy, Medal, Award, Users } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
interface LeaderboardUser {
  id: string
  name: string
  email: string
  image?: string
  xp: number
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  rank: number
}

type TimeFilter = 'weekly' | 'monthly' | 'all-time'

// Mock data - realistic leaderboard data for platform consistency
const mockLeaderboardUsers: LeaderboardUser[] = [
  { id: "1", name: "Alex Chen", email: "alex@tokenx.io", xp: 15420, tier: "PLATINUM", rank: 1 },
  { id: "2", name: "Sarah Kim", email: "sarah@tokenx.io", xp: 14890, tier: "PLATINUM", rank: 2 },
  { id: "3", name: "Marcus Johnson", email: "marcus@tokenx.io", xp: 13750, tier: "GOLD", rank: 3 },
  { id: "4", name: "Elena Rodriguez", email: "elena@tokenx.io", xp: 12980, tier: "GOLD", rank: 4 },
  { id: "5", name: "David Park", email: "david@tokenx.io", xp: 11650, tier: "GOLD", rank: 5 },
  { id: "6", name: "Lisa Wang", email: "lisa@tokenx.io", xp: 10420, tier: "SILVER", rank: 6 },
  { id: "7", name: "James Wilson", email: "james@tokenx.io", xp: 9850, tier: "SILVER", rank: 7 },
  { id: "8", name: "Nina Patel", email: "nina@tokenx.io", xp: 8920, tier: "SILVER", rank: 8 },
  { id: "9", name: "Ryan Miller", email: "ryan@tokenx.io", xp: 8150, tier: "BRONZE", rank: 9 },
  { id: "10", name: "Emma Taylor", email: "emma@tokenx.io", xp: 7680, tier: "BRONZE", rank: 10 }
]

// Helper functions
const formatXP = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  return xp.toString()
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-warning" aria-label="First place" />
    case 2:
      return <Medal className="h-5 w-5 text-muted-foreground" aria-label="Second place" />
    case 3:
      return <Award className="h-5 w-5 text-accent" aria-label="Third place" />
    default:
      return <span className="font-bold text-lg">{rank}</span>
  }
}



// Filter Chips Component - Using platform's established filter system
const FilterChips = ({ activeFilter, onFilterChange }: { 
  activeFilter: TimeFilter
  onFilterChange: (filter: TimeFilter) => void 
}) => {
  const filters: { key: TimeFilter; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'all-time', label: 'All-Time' }
  ]

  return (
          <div 
            className="campaigns-filter-buttons" 
            role="tablist" 
            aria-label="Leaderboard time filter"
          >
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`campaigns-filter-button ${
            activeFilter === key ? 'campaigns-filter-button-active' : 'campaigns-filter-button-inactive'
          }`}
          role="tab"
          aria-selected={activeFilter === key}
          aria-controls={`leaderboard-${key}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// Unified Row Component - Compact and properly contained
const LeaderboardRow = ({ user, isCurrentUser }: { 
  user: LeaderboardUser
  isCurrentUser: boolean 
}) => {
  return (
    <div 
      className={cn(
        "flex items-center w-full",
        "bg-secondary rounded-lg cursor-pointer leaderboard-card-enhanced",
        "border border-border/40",
        "hover:border-primary/30 hover:bg-tertiary/50 hover:opacity-95",
        "dark:hover:border-accent/40",
        isCurrentUser && "border-primary/60 bg-primary/8"
      )}
      style={{
        padding: 'var(--space-4) var(--space-6)',
        gap: 'var(--space-4)',
        minHeight: '72px',
        minWidth: '0',
        overflow: 'visible',
        boxShadow: isCurrentUser 
          ? '0 0 0 1px var(--color-primary-200), 0 2px 4px rgba(0, 0, 0, 0.05)' 
          : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Rank - Properly sized and aligned */}
      <div 
        className="flex items-center justify-center flex-shrink-0"
        style={{
          minWidth: '40px',
          height: '40px',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '600'
        }}
      >
        {user.rank <= 3 ? getRankIcon(user.rank) : (
          <span className="text-foreground">{user.rank}</span>
        )}
      </div>

      {/* Avatar - Properly sized for alignment */}
      <Avatar className="flex-shrink-0 h-10 w-10 avatar-enhanced">
        <AvatarImage src={user.image} alt={user.name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-medium text-sm">
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* User Info - Perfectly aligned row layout */}
      <div className="flex items-center min-w-0 flex-1" style={{ gap: 'var(--space-3)' }}>
        <span 
          className="font-semibold text-sm truncate text-foreground"
          style={{ 
            maxWidth: 'clamp(100px, 20vw, 140px)',
            minWidth: '80px'
          }}
        >
          {user.name}
        </span>
        
        <span 
          className={cn(
            "badge text-xs flex-shrink-0",
            user.tier === 'PLATINUM' && "badge-primary",
            user.tier === 'GOLD' && "badge-accent", 
            user.tier === 'SILVER' && "badge-secondary",
            user.tier === 'BRONZE' && "badge-secondary"
          )}
          style={{ 
            padding: '0 var(--space-2)',
            height: '20px',
            lineHeight: '20px',
            fontSize: 'var(--font-size-xs)',
            minWidth: '60px',
            textAlign: 'center'
          }}
        >
          {user.tier}
        </span>
        
        {isCurrentUser && (
          <span 
            className="badge badge-success text-xs flex-shrink-0"
            style={{ 
              padding: '0 var(--space-2)',
              height: '20px',
              lineHeight: '20px',
              fontSize: 'var(--font-size-xs)',
              minWidth: '40px',
              textAlign: 'center'
            }}
          >
            You
          </span>
        )}
      </div>

      {/* XP Badge - Aligned with other badges */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--space-2)' }}>
        <span 
          className="text-sm font-semibold xp-value-text"
          style={{ 
            color: 'var(--color-success-700)',
            minWidth: '40px',
            textAlign: 'right'
          }}
        >
          {formatXP(user.xp)}
        </span>
        <span 
          className="badge badge-success text-xs"
          style={{ 
            padding: '0 var(--space-2)',
            height: '20px',
            lineHeight: '20px',
            fontSize: 'var(--font-size-xs)',
            minWidth: '30px',
            textAlign: 'center'
          }}
        >
          XP
        </span>
      </div>
    </div>
  )
}



// Skeleton component - Compact design matching LeaderboardRow
const LeaderboardSkeleton = () => {
  return (
    <div 
      className="flex items-center w-full bg-secondary border border-border/40 rounded-lg animate-pulse"
      style={{
        padding: 'var(--space-4) var(--space-6)',
        gap: 'var(--space-4)',
        minHeight: '72px',
        minWidth: '0',
        overflow: 'visible',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Rank placeholder */}
      <div 
        className="flex-shrink-0 bg-muted rounded"
        style={{
          minWidth: '40px',
          height: '40px'
        }}
      />
      
      {/* Avatar placeholder */}
      <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
      
      {/* User info placeholders */}
      <div className="flex items-center min-w-0 flex-1" style={{ gap: 'var(--space-3)' }}>
        <div 
          className="h-4 rounded bg-muted"
          style={{ width: '120px' }}
        />
        <div 
          className="bg-muted rounded flex-shrink-0"
          style={{ 
            width: '60px',
            height: '20px'
          }}
        />
      </div>
      
      {/* XP placeholder */}
      <div className="flex items-center flex-shrink-0" style={{ gap: 'var(--space-2)' }}>
        <div 
          className="bg-muted rounded"
          style={{
            width: '40px',
            height: '16px'
          }}
        />
        <div 
          className="bg-muted rounded"
          style={{
            width: '30px',
            height: '20px'
          }}
        />
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time')
  const [totalUsers, setTotalUsers] = useState(0)

  // Add custom styles for enhanced animations and dark mode contrast
  useEffect(() => {
    // Prevent theme transition flashing by temporarily disabling transitions
    document.documentElement.style.setProperty('--transition-duration', '0ms')
    
    const style = document.createElement('style')
    style.textContent = `
      .leaderboard-card-enhanced {
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      
      .leaderboard-card-enhanced:hover {
        transform: translateY(-1px);
      }
      
      .leaderboard-card-enhanced:active {
        transform: translateY(0);
        transition-duration: 100ms;
      }
      
      /* Dark mode enhanced visibility */
      [data-theme="dark"] .leaderboard-card-enhanced {
        background-color: #23232d !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        color: #f5f5f5 !important;
      }
      
      [data-theme="dark"] .leaderboard-card-enhanced:hover {
        background-color: #2a2a36 !important;
        border-color: rgba(245, 158, 11, 0.4) !important;
        box-shadow: 
          0 0 0 1px rgba(245, 158, 11, 0.3),
          0 4px 16px rgba(0, 0, 0, 0.25),
          0 0 24px rgba(245, 158, 11, 0.15);
      }
      
      /* Dark mode text enhancement */
      [data-theme="dark"] .leaderboard-card-enhanced .text-foreground {
        color: #f8fafc !important;
        font-weight: 600 !important;
      }
      
      [data-theme="dark"] .leaderboard-card-enhanced .badge {
        background-color: rgba(255, 255, 255, 0.12) !important;
        color: #e2e8f0 !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      [data-theme="dark"] .leaderboard-card-enhanced .badge-primary {
        background-color: rgba(59, 130, 246, 0.2) !important;
        color: #93c5fd !important;
        border-color: rgba(59, 130, 246, 0.4) !important;
      }
      
      [data-theme="dark"] .leaderboard-card-enhanced .badge-success {
        background-color: rgba(34, 197, 94, 0.2) !important;
        color: #86efac !important;
        border-color: rgba(34, 197, 94, 0.4) !important;
      }
      
      [data-theme="dark"] .leaderboard-card-enhanced .badge-accent {
        background-color: rgba(245, 158, 11, 0.2) !important;
        color: #fbbf24 !important;
        border-color: rgba(245, 158, 11, 0.4) !important;
      }
      
      /* Light mode specific hover effects */
      [data-theme="light"] .leaderboard-card-enhanced:hover,
      .leaderboard-card-enhanced:hover {
        box-shadow: 
          0 0 0 1px rgba(21, 163, 175, 0.2),
          0 4px 12px rgba(0, 0, 0, 0.1),
          0 0 15px rgba(21, 163, 175, 0.05);
      }
      
      /* Active competitors card enhancement */
      .competitors-card-enhanced {
        transition: all 200ms ease-out;
        backdrop-filter: blur(1px);
      }
      
      [data-theme="dark"] .competitors-card-enhanced {
        background-color: rgba(245, 158, 11, 0.15) !important;
        border-color: rgba(245, 158, 11, 0.4) !important;
      }
      
      [data-theme="dark"] .competitors-card-enhanced .text-sm {
        color: #fbbf24 !important;
        font-weight: 700 !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
      }
      
      [data-theme="dark"] .competitors-card-enhanced svg {
        filter: brightness(1.4) saturate(1.2) !important;
        color: #fbbf24 !important;
      }
      
      .competitors-card-enhanced:hover {
        transform: translateY(-1px);
      }
      
      [data-theme="dark"] .competitors-card-enhanced:hover {
        background-color: rgba(245, 158, 11, 0.25) !important;
        border-color: rgba(245, 158, 11, 0.6) !important;
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2) !important;
      }
      
      /* Dark mode XP value enhancement */
      [data-theme="dark"] .xp-value-text {
        color: #86efac !important;
        font-weight: 700 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
      }
      
      /* Dark mode rank enhancement */
      [data-theme="dark"] .leaderboard-card-enhanced svg {
        filter: brightness(1.3) saturate(1.1) !important;
      }
      
      /* Dark mode current user highlight */
      [data-theme="dark"] .leaderboard-card-enhanced.border-primary\\/60 {
        border-color: rgba(59, 130, 246, 0.6) !important;
        background-color: rgba(59, 130, 246, 0.08) !important;
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(59, 130, 246, 0.15) !important;
      }
      
      /* Dark mode avatar enhancement */
      [data-theme="dark"] .avatar-enhanced {
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      }
      
      [data-theme="dark"] .avatar-enhanced .bg-primary {
        background-color: #3b82f6 !important;
        color: #ffffff !important;
        font-weight: 600 !important;
      }
      
      /* Dark mode skeleton enhancement */
      [data-theme="dark"] .animate-pulse > div {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Completely eliminate any potential bars and ensure smooth theme transitions */
      *,
      *::before,
      *::after {
        transition: none !important;
        animation: none !important;
      }
      
      /* Prevent any flashing during theme changes */
      html,
      #__next {
        transition: none !important;
      }
      
      /* Remove all potential bar-creating elements */
      .daily-tasks-main,
      .page-container,
      main,
      div[style*="minHeight: 100vh"] {
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Clean page container styling */
      .page-container {
        border-radius: 0 !important;
        margin-top: 0 !important;
        padding-top: var(--space-8) !important;
      }
      
      /* Header and title styling */
      [data-theme="dark"] .daily-tasks-title {
        color: #f8fafc !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
      }
      
      [data-theme="dark"] .daily-tasks-subtitle {
        color: #cbd5e1 !important;
      }
      
      /* Accent bar - make it completely invisible during transitions */
      .header-accent-bar {
        position: absolute !important;
        left: -24px !important;
        top: 0 !important;
        width: 4px !important;
        height: 60px !important;
        z-index: 1 !important;
        pointer-events: none !important;
        background-color: var(--color-primary-500) !important;
        opacity: 0 !important;
        transition: opacity 300ms ease-in-out !important;
      }
      
      /* Show accent bar only after theme transition */
      .daily-tasks-header:hover .header-accent-bar {
        opacity: 1 !important;
      }
      
      [data-theme="dark"] .header-accent-bar {
        background-color: #fbbf24 !important;
        box-shadow: 0 0 8px rgba(251, 191, 36, 0.4) !important;
      }
      
      .daily-tasks-header {
        position: relative !important;
        overflow: visible !important;
        background: transparent !important;
      }
      
      /* Hide all pseudo-elements that might create bars */
      *::before,
      *::after {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
      
      /* Remove any potential navbar bottom border */
      nav,
      .nav,
      .navbar {
        border-bottom: none !important;
        box-shadow: none !important;
      }
      
      /* Dark mode empty state enhancement */
      [data-theme="dark"] .empty-tasks-card {
        background-color: #23232d !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        color: #f8fafc !important;
      }
      
      [data-theme="dark"] .empty-title {
        color: #f8fafc !important;
      }
      
      [data-theme="dark"] .empty-desc {
        color: #cbd5e1 !important;
      }
    `
    document.head.appendChild(style)
    
    // Re-enable transitions after a short delay
    setTimeout(() => {
      document.documentElement.style.removeProperty('--transition-duration')
    }, 100)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 800))
      
      try {
        setUsers(mockLeaderboardUsers)
        setTotalUsers(mockLeaderboardUsers.length)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeFilter, toast])

  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <div className="leaderboard-center-wrapper">
          {/* Integrated Header Card - Title, Description, Stats, and Filters */}
          <section className="leaderboard-integrated-header">
            <div className="leaderboard-header-content">
              {/* Title and Description */}
              <div className="leaderboard-title-section">
                <h1 className="leaderboard-main-title">🏆 Leaderboard</h1>
                <p className="leaderboard-main-subtitle">
                  Compete for the top spot and earn your place among the elite
                </p>
              </div>
              
              {/* Bottom Row: Stats (Left) + Filters (Right) */}
              <div className="leaderboard-bottom-controls">
                {/* Active Competitors Display - Left aligned */}
                <div className="leaderboard-stats-pill">
                  <div 
                    className="bg-warning/10 border border-warning/20 rounded-lg flex items-center w-fit competitors-card-enhanced"
                    style={{ 
                      padding: 'var(--space-3) var(--space-4)',
                      gap: 'var(--space-2)',
                      minHeight: '40px'
                    }}
                  >
                    <Users 
                      className="h-4 w-4 flex-shrink-0" 
                      style={{ 
                        color: 'var(--color-warning-600)',
                        filter: 'brightness(1.2) saturate(1.1)'
                      }}
                    />
                    <span 
                      className="font-semibold text-sm"
                      style={{ 
                        color: 'var(--color-warning-700)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {totalUsers} Active Competitors
                    </span>
                  </div>
                </div>
                
                {/* Filter Chips - Right aligned */}
                <div className="leaderboard-filters-section">
                  <FilterChips activeFilter={timeFilter} onFilterChange={handleFilterChange} />
                </div>
              </div>
            </div>
          </section>

          {/* Leaderboard Content Section */}
          <section className="leaderboard-list-section">
            <div 
              className="leaderboard-list-container"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                minWidth: '0',
                maxWidth: '100%'
              }}
            >
            {loading ? (
              <>
                {/* Loading Skeletons - All unified */}
                {Array.from({ length: 10 }).map((_, index) => (
                  <LeaderboardSkeleton key={index} />
                ))}
              </>
            ) : users.length === 0 ? (
              /* Empty State - Consistent with platform empty states */
              <div className="empty-tasks-card">
                <Trophy className="h-16 w-16 opacity-50 text-muted-foreground" style={{ marginBottom: 'var(--space-4)' }} />
                <span className="empty-title">No leaderboard data available</span>
                <span className="empty-desc">
                  Complete tasks to see your ranking and compete with other ambassadors.
                </span>
              </div>
            ) : (
              <>
                {/* All Leaderboard Rows - Compact and properly contained */}
                {users.map((user) => (
                  <LeaderboardRow
                    key={user.id}
                    user={user}
                    isCurrentUser={session?.user?.email === user.email}
                  />
                ))}
              </>
            )}
            </div>
          </section>
      </div>
    </div>
  )
}
