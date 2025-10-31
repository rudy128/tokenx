"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/NavBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users, Calendar, Trophy, Clock, CheckCircle, Eye, Zap, Target, Star, Search, ArrowLeft, Loader2,
  Filter, User, Play, CalendarClock, Grid3X3, CheckCircle2, Bolt, Coins, UsersRound, LogIn
} from "lucide-react"
import { validateCampaignJoin } from "@/lib/campaign-validation" // This was in File 1, keeping it.

// Filter options with icons and labels (FROM FILE 1)
type FilterOption = 'all' | 'joined' | 'available' | 'active' | 'draft'

const FILTERS = [
  {
    label: "All Campaigns",
    value: "all" as FilterOption,
    icon: <Grid3X3 className="h-4 w-4 mr-2" />
  },
  {
    label: "My Campaigns",
    value: "joined" as FilterOption,
    icon: <User className="h-4 w-4 mr-2" />
  },
  {
    label: "Available",
    value: "available" as FilterOption,
    icon: <CheckCircle2 className="h-4 w-4 mr-2" />
  },
  {
    label: "Active",
    value: "active" as FilterOption,
    icon: <Bolt className="h-4 w-4 mr-2" />
  },
  {
    label: "Coming Soon",
    value: "draft" as FilterOption,
    icon: <CalendarClock className="h-4 w-4 mr-2" />
  },
]

// Campaign Interface (FROM FILE 1)
interface Campaign {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "DRAFT" | "COMPLETED"
  startDate: string
  endDate: string
  participantLimit: number
  currentParticipants: number
  rewardPool: number
  rewardToken: string
  eligibilityCriteria: string[]
  bannerUrl?: string
  image?: string
  isJoined?: boolean
  userProgress?: {
    completedTasks: number
    totalTasks: number
    earnedXP: number
  }
  tags?: string[]
  difficulty?: "easy" | "medium" | "hard"
  estimatedDuration?: string
}

// CampaignCard Component (FROM FILE 1)
const CampaignCard = ({ campaign, onViewDetails, onJoinCampaign, isJoining }: {
  campaign: Campaign;
  onViewDetails: (campaign: Campaign) => void;
  onJoinCampaign: (campaignId: string) => void;
  isJoining: boolean;
}) => (
  <div
    className="campaign-card"
    onClick={() => onViewDetails(campaign)}
  >
    {/* Colorful Grid Banner Section */}
    <div className="campaign-card-banner-container">
      {/* Grid Pattern Background */}
      <div className="campaign-card-grid-banner">
        {/* Campaign Content Overlay */}
        <div className="campaign-card-banner-content">
          {campaign.image || campaign.bannerUrl ? (
            <img
              src={campaign.image || campaign.bannerUrl}
              alt={campaign.name}
              className="campaign-card-banner-image"
            />
          ) : (
            <div className="campaign-card-banner-title">
              {campaign.name}
            </div>
          )}
        </div>

        {/* Grid Pattern Overlay */}
        <div className="campaign-card-grid-overlay"></div>
      </div>

      {/* Status Badge */}
      <div className={`campaign-card-status ${
        campaign.status === "ACTIVE" ? "active" :
        campaign.status === "DRAFT" ? "draft" :
        "completed"
      }`}>
        {campaign.status === "ACTIVE" ? "ACTIVE" :
         campaign.status === "DRAFT" ? "UPCOMING" :
         "COMPLETED"}
      </div>
    </div>

    {/* Content Area */}
    <div className="campaign-card-content">
      {/* Header */}
      <div className="campaign-card-header">
        <h3 className="campaign-card-title">
          {campaign.name}
        </h3>
        <p className="campaign-card-description">
          {campaign.description}
        </p>
      </div>

      {/* Stats */}
      <div className="campaign-card-stats">
        <div className="campaign-card-stat">
          <div className="campaign-card-stat-icon-wrapper participants">
            <UsersRound className="campaign-card-stat-icon" />
          </div>
          <div className="campaign-card-stat-content">
            <div className="campaign-card-stat-value">{campaign.currentParticipants}</div>
            <div className="campaign-card-stat-label">/{campaign.participantLimit} participants</div>
          </div>
        </div>
        <div className="campaign-card-stat">
          <div className="campaign-card-stat-icon-wrapper tokens">
            <Coins className="campaign-card-stat-icon" />
          </div>
          <div className="campaign-card-stat-content">
            <div className="campaign-card-stat-value">{campaign.rewardPool}</div>
            <div className="campaign-card-stat-label">{campaign.rewardToken}</div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="campaign-card-dates">
        <div className="campaign-card-date">
          <Calendar className="campaign-card-date-icon" />
          <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
        </div>
        <div className="campaign-card-date">
          <Clock className="campaign-card-date-icon" />
          <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Progress Bar (always render for consistent alignment) */}
      <div className={`campaign-card-progress ${!campaign.userProgress ? 'empty' : ''}`}>
        {campaign.userProgress ? (
          <>
            <div className="campaign-card-progress-header">
              <span>Progress</span>
              <span>{campaign.userProgress.completedTasks}/{campaign.userProgress.totalTasks} tasks</span>
            </div>
            <div className="campaign-card-progress-bar">
              <div
                className="campaign-card-progress-fill"
                style={{
                  width: `${Math.min((campaign.userProgress.completedTasks / campaign.userProgress.totalTasks) * 100, 100)}%`
                }}
              />
            </div>
            <div className="campaign-card-xp-badge">
              <Zap className="campaign-card-xp-icon" />
              <span>{campaign.userProgress.earnedXP} XP earned</span>
            </div>
          </>
        ) : (
          <div className="campaign-card-progress-placeholder">
            {/* Invisible spacer to maintain exact height alignment with joined cards */}
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="campaign-card-footer">
        {/* Tags - Always positioned directly above CTA with divider */}
        {campaign.tags && campaign.tags.length > 0 ? (
          <>
            <div className="campaign-card-tags">
              {campaign.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="campaign-card-tag">
                  {tag}
                </span>
              ))}
              {campaign.tags.length > 3 && (
                <span className="campaign-card-tag">
                  +{campaign.tags.length - 3}
                </span>
              )}
            </div>
            <div className="campaign-card-divider"></div>
          </>
        ) : (
          <div className="campaign-card-divider"></div>
        )}
        {campaign.isJoined ? (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(campaign); }}
            className="campaign-card-button joined"
          >
            <Target className="campaign-card-button-icon" />
            View Tasks
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (campaign.currentParticipants < campaign.participantLimit) {
                onJoinCampaign(campaign.id);
              }
            }}
            className={`campaign-card-button ${
              campaign.currentParticipants >= campaign.participantLimit ? "full" : "join"
            }`}
            disabled={campaign.currentParticipants >= campaign.participantLimit || isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="campaign-card-button-icon animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Users className="campaign-card-button-icon" />
                {campaign.currentParticipants >= campaign.participantLimit ? "Campaign Full" : "Join Campaign"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

// CampaignSkeleton Component (FROM FILE 1)
function CampaignSkeleton() {
  return (
    <div className="campaign-card-skeleton">
      <div className="campaign-card-skeleton-card">
        {/* Banner container with status badge - matches real banner container */}
        <div className="campaign-card-skeleton-banner-container">
          <div className="campaign-card-skeleton-grid-banner" />
          {/* Status badge placeholder - matches real status badge */}
          <div className="campaign-card-skeleton-status-badge" />
        </div>

        {/* Content section - matches real campaign-card-content */}
        <div className="campaign-card-skeleton-content">
          {/* Header - matches title and description */}
          <div className="campaign-card-skeleton-header">
            <div className="campaign-card-skeleton-title" />
            <div className="campaign-card-skeleton-description" />
            <div className="campaign-card-skeleton-description short" />
          </div>

          {/* Stats section - matches participant/token stats with icons */}
          <div className="campaign-card-skeleton-stats">
            <div className="campaign-card-skeleton-stat">
              <div className="campaign-card-skeleton-stat-icon-wrapper" />
              <div className="campaign-card-skeleton-stat-content">
                <div className="campaign-card-skeleton-stat-value" />
                <div className="campaign-card-skeleton-stat-label" />
              </div>
            </div>
            <div className="campaign-card-skeleton-stat">
              <div className="campaign-card-skeleton-stat-icon-wrapper" />
              <div className="campaign-card-skeleton-stat-content">
                <div className="campaign-card-skeleton-stat-value" />
                <div className="campaign-card-skeleton-stat-label" />
              </div>
            </div>
          </div>

          {/* Dates section - matches real dates with icons */}
          <div className="campaign-card-skeleton-dates">
            <div className="campaign-card-skeleton-date">
              <div className="campaign-card-skeleton-date-icon" />
              <div className="campaign-card-skeleton-date-text" />
            </div>
            <div className="campaign-card-skeleton-date">
              <div className="campaign-card-skeleton-date-icon" />
              <div className="campaign-card-skeleton-date-text" />
            </div>
          </div>

          {/* Progress placeholder - matches real progress section */}
          <div className="campaign-card-skeleton-progress">
            <div className="campaign-card-skeleton-progress-header">
              <div className="campaign-card-skeleton-progress-label" />
              <div className="campaign-card-skeleton-progress-count" />
            </div>
            <div className="campaign-card-skeleton-progress-bar" />
            <div className="campaign-card-skeleton-xp-badge">
              <div className="campaign-card-skeleton-xp-icon" />
              <div className="campaign-card-skeleton-xp-text" />
            </div>
          </div>

          {/* Footer - matches tags, divider, and button */}
          <div className="campaign-card-skeleton-footer">
            {/* Tags placeholder */}
            <div className="campaign-card-skeleton-tags">
              <div className="campaign-card-skeleton-tag" />
              <div className="campaign-card-skeleton-tag" />
              <div className="campaign-card-skeleton-tag small" />
            </div>
            {/* Divider - matches real divider */}
            <div className="campaign-card-skeleton-divider" />
            {/* Button - matches real button with icon */}
            <div className="campaign-card-skeleton-button">
              <div className="campaign-card-skeleton-button-icon" />
              <div className="campaign-card-skeleton-button-text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([])
  const [joinedCampaigns, setJoinedCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [joiningCampaignId, setJoiningCampaignId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // useEffect (FROM FILE 2)
  useEffect(() => {
    if (sessionStatus !== 'loading') {
      fetchCampaigns()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus])

  // onViewDetails (FROM FILE 1)
  const onViewDetails = (campaign: Campaign) => {
    if (campaign.isJoined) {
      router.push(`/dashboard/campaigns/${campaign.id}/tasks`)
    } else {
      // For available campaigns, show join modal or navigate to details page
      router.push(`/dashboard/campaigns/${campaign.id}`)
    }
  }

  // joinCampaign (FROM FILE 2)
  const joinCampaign = async (campaignId: string) => {
    try {
      setJoiningCampaignId(campaignId)
      if (sessionStatus === 'loading') {
        toast({ title: "Please wait", description: "Checking your authentication status..." })
        return
      }
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join campaigns.",
          variant: "destructive"
        })
        return
      }
      const response = await fetch(`/api/campaigns/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      const data = await response.json()
      if (!response.ok) {
        let description = data.message || data.error || "Failed to join campaign"
        
        // Use the improved error messages from the API
        if (data.error?.includes("already applied")) {
          description = data.message || "You've already applied to this campaign. Check your joined campaigns."
        } else if (data.error?.includes("Campaign is full")) {
          description = data.message || "This campaign has reached its participant limit."
        } else if (data.error?.includes("User not found")) {
          description = data.message || "Authentication issue. Please try signing out and back in."
        }
        
        toast({ 
          title: "Campaign Join Failed", 
          description, 
          variant: "destructive" 
        })
        return
      }
      
      // Refresh campaigns to show updated state
      await fetchCampaigns()
      
      // Use the success message from the API
      const successMessage = data.message || "You've successfully joined the campaign!"
      toast({ 
        title: "Success! 🎉", 
        description: successMessage 
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" })
    } finally {
      setJoiningCampaignId(null)
    }
  }

  // fetchCampaigns (FROM FILE 2)
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      const availableResponse = await fetch('/api/campaigns?joined=false', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      const joinedResponse = await fetch('/api/campaigns?joined=true', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!availableResponse.ok || !joinedResponse.ok) {
        setAvailableCampaigns([])
        setJoinedCampaigns([])
        throw new Error('Failed to fetch campaigns')
      }
      const availableData = await availableResponse.json()
      const joinedData = await joinedResponse.json()
      setAvailableCampaigns(Array.isArray(availableData) ? availableData : [])
      setJoinedCampaigns(Array.isArray(joinedData) ? joinedData : [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load campaigns",
        variant: "destructive"
      })
      setAvailableCampaigns([])
      setJoinedCampaigns([])
    } finally {
      setIsLoading(false)
    }
  }

  // getFilteredCampaigns (FROM FILE 1)
  const getFilteredCampaigns = () => {
    const allCampaigns = [...joinedCampaigns, ...availableCampaigns]

    switch (activeFilter) {
      case 'joined':
        return joinedCampaigns
      case 'available':
        return availableCampaigns.filter(campaign => campaign.status === 'ACTIVE')
      case 'active':
        return allCampaigns.filter(campaign => campaign.status === 'ACTIVE')
      case 'draft':
        return allCampaigns.filter(campaign => campaign.status === 'DRAFT')
      default:
        return allCampaigns
    }
  }

  // filteredCampaigns (FROM FILE 1)
  const filteredCampaigns = getFilteredCampaigns().filter(
    campaign =>
      searchTerm === '' ||
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.tags && campaign.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  // Full Rich JSX (FROM FILE 1)
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main className="campaigns-main-content">
        <div className="campaigns-content-grid">
          {/* Header Section */}
          <section className="campaigns-header-section">
            <div className="campaigns-hero-content">
              <h1 className="campaigns-main-title">
                Campaign Hub
              </h1>
              <p className="campaigns-main-subtitle">
                Discover exciting campaigns, earn rewards, and build your ambassador reputation
              </p>
            </div>

            {/* Stats Cards */}
            <div className="campaigns-stats-grid">
              <div className="campaigns-stat-card campaigns-stat-card-primary">
                <div className="campaigns-stat-content">
                  <div className="campaigns-stat-info">
                    <p className="campaigns-stat-label">Active Campaigns</p>
                    <p className="campaigns-stat-value">
                      {[...joinedCampaigns, ...availableCampaigns].filter(c => c.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="campaigns-stat-icon campaigns-stat-icon-primary">
                    <Users className="campaigns-icon" />
                  </div>
                </div>
              </div>

              <div className="campaigns-stat-card campaigns-stat-card-success">
                <div className="campaigns-stat-content">
                  <div className="campaigns-stat-info">
                    <p className="campaigns-stat-label">My Campaigns</p>
                    <p className="campaigns-stat-value">{joinedCampaigns.length}</p>
                  </div>
                  <div className="campaigns-stat-icon campaigns-stat-icon-success">
                    <User className="campaigns-icon" />
                  </div>
                </div>
              </div>

              <div className="campaigns-stat-card campaigns-stat-card-warning">
                <div className="campaigns-stat-content">
                  <div className="campaigns-stat-info">
                    <p className="campaigns-stat-label">Total Rewards</p>
                    <p className="campaigns-stat-value">
                      {[...joinedCampaigns, ...availableCampaigns].reduce((total, campaign) => total + campaign.rewardPool, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="campaigns-stat-icon campaigns-stat-icon-warning">
                    <Zap className="campaigns-icon" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="campaigns-filter-section">
              <div className="campaigns-filter-content">
                <div className="campaigns-filter-header">
                  <div className="campaigns-filter-title-area">
                    <Filter className="campaigns-filter-icon" />
                    <span className="campaigns-filter-title">Filter Campaigns</span>
                  </div>

                  <div className="campaigns-filter-buttons">
                    {FILTERS.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setActiveFilter(filter.value)}
                        className={`campaigns-filter-button ${
                          activeFilter === filter.value ? 'campaigns-filter-button-active' : 'campaigns-filter-button-inactive'
                        }`}
                      >
                        {filter.icon}
                        {filter.label}
                        <span className="campaigns-filter-button-count">
                          {filter.value === 'all' ? filteredCampaigns.length :
                           filter.value === 'joined' ? joinedCampaigns.length :
                           filter.value === 'available' ? availableCampaigns.filter(c => c.status === 'ACTIVE').length :
                           filter.value === 'active' ? [...joinedCampaigns, ...availableCampaigns].filter(c => c.status === 'ACTIVE').length :
                           [...joinedCampaigns, ...availableCampaigns].filter(c => c.status === 'DRAFT').length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="campaigns-search-container">
                  <Search className="campaigns-search-icon" />
                  <input
                    type="text"
                    placeholder="Search campaigns by name, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="campaigns-search-input"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Campaigns Grid */}
          <section className="campaigns-content-section">
            {isLoading ? (
              <div className="campaigns-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CampaignSkeleton key={i} />
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              // Rich Empty State (FROM FILE 1)
              <div className="campaigns-empty-state">
                <div className="campaigns-empty-content">
                  <div className="campaigns-empty-icon-container">
                    <Trophy className="campaigns-empty-icon" />
                  </div>
                  <h3 className="campaigns-empty-title">
                    No campaigns found
                  </h3>
                  <p className="campaigns-empty-description">
                    {activeFilter === 'joined'
                      ? "You haven't joined any campaigns yet. Explore available campaigns to get started!"
                      : activeFilter === 'available'
                      ? "No new campaigns available at the moment. Check back later for exciting opportunities!"
                      : searchTerm
                      ? "No campaigns match your search criteria. Try adjusting your search terms."
                      : "No campaigns match your current filter. Try adjusting your filter options."
                    }
                  </p>
                  {(activeFilter !== 'all' || searchTerm) && (
                    <div className="campaigns-empty-actions">
                      {activeFilter !== 'all' && (
                        <button
                          onClick={() => setActiveFilter('all')}
                          className="campaigns-empty-button campaigns-empty-button-outline"
                        >
                          View All Campaigns
                        </button>
                      )}
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="campaigns-empty-button campaigns-empty-button-outline"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="campaigns-grid">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={onViewDetails}
                    onJoinCampaign={joinCampaign}
                    isJoining={joiningCampaignId === campaign.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}