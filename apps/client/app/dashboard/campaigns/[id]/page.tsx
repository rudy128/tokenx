"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft, Users, Calendar, Trophy, Clock, CheckCircle, 
  Zap, Target, Star, Play, Loader2, ExternalLink 
} from "lucide-react"

interface Campaign {
  id: string
  name: string
  description: string
  status: "ACTIVE" | "DRAFT" | "COMPLETED" | "PAUSED" | "CANCELLED"
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

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [refreshFlag, setRefreshFlag] = useState(0) // To force reload after join

  const campaignId = params.id as string

  useEffect(() => {
    if (!campaignId) return
    const fetchCampaign = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`)
        if (!res.ok) throw new Error("not found")
        const foundCampaign = await res.json()
        setCampaign(foundCampaign)
      } catch (err) {
        toast({
          title: "Campaign not found",
          description: "The requested campaign could not be found.",
          variant: "destructive"
        })
        router.push("/dashboard/campaigns")
      }
      setLoading(false)
    }
    fetchCampaign()
    // adding `refreshFlag` lets us reload after successful join
  }, [campaignId, router, toast, refreshFlag])

  const handleJoinCampaign = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join campaigns.",
        variant: "destructive"
      })
      return
    }
    setJoining(true)
    try {
      const res = await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId })
      })
      const result = await res.json()
      if (res.ok) {
        toast({
          title: "Successfully joined campaign!",
          description: `You've joined "${campaign?.name}". You can now view tasks for this campaign.`,
        })
        // Reload campaign details to get isJoined and new state
        setRefreshFlag(flag => flag + 1)
      } else {
        toast({
          title: "Failed to join campaign",
          description: result?.error || "Please try again later.",
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Failed to join campaign",
        description: "Network/server error. Please try again later.",
        variant: "destructive"
      })
    }
    setJoining(false)
  }

  const handleViewTasks = () => {
    router.push(`/dashboard/campaigns/${campaignId}/tasks`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'DRAFT': return 'text-gray-600 bg-gray-100'
      case 'COMPLETED': return 'text-blue-600 bg-blue-100'
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <NavBar />
        <main className="flex justify-center items-center min-h-[50vh]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading campaign details...</span>
          </div>
        </main>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <NavBar />
        <main className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-gray-600 mb-4">The requested campaign could not be found.</p>
            <Button onClick={() => router.push('/dashboard/campaigns')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/campaigns')}
            className="text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
        <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-xl p-8 mb-6">
          {campaign.bannerUrl && (
            <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-white text-center">
                <Zap className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm opacity-90">Campaign Banner</p>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-var(--text-primary)">{campaign.name}</h1>
                <Badge className={`px-2 py-1 text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-lg text-var(--text-secondary) mb-4 leading-relaxed">
                {campaign.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {campaign.difficulty && (
                  <Badge className={`text-xs ${getDifficultyColor(campaign.difficulty)}`}>
                    {campaign.difficulty.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 lg:min-w-[200px]">
              {campaign.isJoined ? (
                <>
                  <Button 
                    onClick={handleViewTasks}
                    size="lg"
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    View Tasks
                  </Button>
                  <Badge className="w-full mt-2 py-2 text-center bg-green-100 text-green-700 text-sm font-semibold">Joined</Badge>
                </>
              ) : (
                <Button 
                  onClick={handleJoinCampaign}
                  disabled={joining || campaign.status === 'DRAFT'}
                  size="lg"
                  className="w-full"
                >
                  {joining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : campaign.status === 'DRAFT' ? (
                    'Coming Soon'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Join Campaign
                    </>
                  )}
                </Button>
              )}
              {campaign.userProgress && (
                <div className="text-center p-3 bg-var(--bg-secondary) rounded-lg">
                  <div className="text-sm text-var(--text-secondary)">Your Progress</div>
                  <div className="text-lg font-semibold">
                    {campaign.userProgress.completedTasks}/{campaign.userProgress.totalTasks} Tasks
                  </div>
                  <div className="text-sm text-var(--text-secondary)">
                    {campaign.userProgress.earnedXP} XP Earned
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm text-var(--text-secondary)">Participants</div>
                <div className="text-lg font-semibold">
                  {campaign.currentParticipants}/{campaign.participantLimit}
                </div>
              </div>
              <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-4 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-sm text-var(--text-secondary)">Reward Pool</div>
                <div className="text-lg font-semibold">
                  {campaign.rewardPool.toLocaleString()} {campaign.rewardToken}
                </div>
              </div>
              <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <div className="text-sm text-var(--text-secondary)">Duration</div>
                <div className="text-sm font-semibold">
                  {campaign.estimatedDuration || 'Flexible'}
                </div>
              </div>
              <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-sm text-var(--text-secondary)">Status</div>
                <div className="text-sm font-semibold">
                  {campaign.status}
                </div>
              </div>
            </div>
            <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">Start Date:</span>
                  <span className="font-medium">{formatDate(campaign.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">End Date:</span>
                  <span className="font-medium">{formatDate(campaign.endDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">Duration:</span>
                  <span className="font-medium">{campaign.estimatedDuration || 'Flexible'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Eligibility Requirements</h3>
              <ul className="space-y-3">
                {campaign.eligibilityCriteria.map((criteria, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-var(--text-secondary)">{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-var(--bg-elevated) border border-var(--border-subtle) rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Campaign Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">Campaign ID:</span>
                  <span className="font-mono">{campaign.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">Difficulty:</span>
                  <Badge className={`text-xs ${getDifficultyColor(campaign.difficulty || 'medium')}`}>
                    {(campaign.difficulty || 'medium').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-var(--text-secondary)">Reward Token:</span>
                  <span className="font-medium">{campaign.rewardToken}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
