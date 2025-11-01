"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/NavBar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Trophy, Medal, Award, Users, Crown, Star, Gem, Shield } from "lucide-react"
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

// Helper functions - Standardized XP formatting
const formatXP = (xp: number): string => {
  // Use comma-separated format for better readability
  return xp.toLocaleString('en-US')
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

// Tier badge configuration with branded icons - colors handled by CSS
const getTierConfig = (tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM') => {
  switch (tier) {
    case 'PLATINUM':
      return { icon: Crown, label: 'Platinum' }
    case 'GOLD':
      return { icon: Gem, label: 'Gold' }
    case 'SILVER':
      return { icon: Star, label: 'Silver' }
    case 'BRONZE':
      return { icon: Shield, label: 'Bronze' }
  }
}



// Unified Row Component - Horizontal leaderboard layout
const LeaderboardRow = ({ user, isCurrentUser, index, maxXP }: { 
  user: LeaderboardUser
  isCurrentUser: boolean
  index: number
  maxXP: number
}) => {
  const tierConfig = getTierConfig(user.tier)
  const TierIcon = tierConfig.icon
  
  return (
    <div 
      className={cn(
        "leaderboard-card-enhanced",
        isCurrentUser && "current-user-card"
      )}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Rank Badge */}
      <div className="rank-badge-enhanced">
        <div className={cn(
          "rank-badge-premium",
          user.rank === 1 && "rank-1-premium",
          user.rank === 2 && "rank-2-premium",
          user.rank === 3 && "rank-3-premium",
          user.rank > 3 && "rank-other-premium"
        )}>
          {user.rank <= 3 ? (
            <>
              <div className="rank-icon-wrapper">
                {getRankIcon(user.rank)}
              </div>
              <span className="rank-number-premium">#{user.rank}</span>
            </>
          ) : (
            <span className="rank-number-premium">#{user.rank}</span>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="avatar-section-enhanced">
        <Avatar className="user-avatar-enhanced">
          <AvatarImage src={user.image} alt={user.name} />
          <AvatarFallback className="avatar-fallback-enhanced">
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User Info */}
      <div className="user-info-enhanced">
        <div className="username-row-enhanced">
          <span className="username-enhanced">{user.name}</span>
          {isCurrentUser && (
            <span className="you-badge-enhanced">YOU</span>
          )}
        </div>
        <div className={cn(
          "tier-badge-enhanced",
          `tier-${user.tier.toLowerCase()}`
        )}>
          <TierIcon className="tier-icon-enhanced" />
          <span>{tierConfig.label}</span>
        </div>
      </div>

      {/* XP Display */}
      <div className="xp-section-enhanced">
        <div className="xp-pill-enhanced">
          <span className="xp-label-enhanced">XP</span>
          <span className="xp-value-enhanced">{formatXP(user.xp)}</span>
        </div>
      </div>
    </div>
  )
}



// Skeleton component - Matching horizontal layout
const LeaderboardSkeleton = () => {
  return (
    <div className="leaderboard-card-skeleton">
      <div className="rank-skeleton" />
      <div className="avatar-skeleton-enhanced" />
      <div className="user-info-skeleton-enhanced">
        <div className="username-skeleton-enhanced" />
        <div className="tier-skeleton-enhanced" />
      </div>
      <div className="xp-skeleton-enhanced" />
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
      <main className="dashboard-main">
        {/* Header Section with Stats - Consistent with campaigns */}
        <div className="campaigns-header-section">
          <div className="campaigns-hero-content">
            <h1 className="campaigns-main-title">
              🏆 Leaderboard
            </h1>
            <p className="campaigns-main-subtitle">
              Compete for the top spot and earn your place among the elite
            </p>
          </div>

          {/* Stats Card - Active Competitors */}
          <div className="campaigns-stats-grid">
            <div className="campaigns-stat-card campaigns-stat-card-warning">
              <div className="campaigns-stat-content">
                <div className="campaigns-stat-info">
                  <p className="campaigns-stat-label">Active Competitors</p>
                  <p className="campaigns-stat-value">{totalUsers}</p>
                </div>
                <div className="campaigns-stat-icon campaigns-stat-icon-warning">
                  <Users className="campaigns-icon" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs - Inline without card */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
              {[
                { key: 'weekly' as TimeFilter, label: 'Weekly' },
                { key: 'monthly' as TimeFilter, label: 'Monthly' },
                { key: 'all-time' as TimeFilter, label: 'All-Time' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key)}
                  className={`campaigns-filter-button ${
                    timeFilter === key ? 'campaigns-filter-button-active' : 'campaigns-filter-button-inactive'
                  }`}
                  style={{
                    background: timeFilter === key ? 'var(--interactive-primary)' : 'transparent',
                    color: timeFilter === key ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: timeFilter === key ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    minHeight: '36px'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard Content Section */}
        <section className="leaderboard-grid-enhanced" style={{ marginTop: 'var(--space-8)' }}>
          {loading ? (
            <>
              {/* Loading Skeletons */}
              {Array.from({ length: 10 }).map((_, index) => (
                <LeaderboardSkeleton key={index} />
              ))}
            </>
          ) : users.length === 0 ? (
            /* Empty State */
            <div className="empty-tasks-card">
              <Trophy className="h-16 w-16 opacity-50 text-muted-foreground" style={{ marginBottom: 'var(--space-4)' }} />
              <span className="empty-title">No leaderboard data available</span>
              <span className="empty-desc">
                Complete tasks to see your ranking and compete with other ambassadors.
              </span>
            </div>
          ) : (
            <>
              {/* Leaderboard Rows */}
              {users.map((user, index) => (
                <LeaderboardRow
                  key={user.id}
                  user={user}
                  isCurrentUser={session?.user?.email === user.email}
                  index={index}
                  maxXP={users[0]?.xp || user.xp}
                />
              ))}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
