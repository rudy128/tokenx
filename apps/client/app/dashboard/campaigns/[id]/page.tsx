"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { NavBar } from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, Users, Calendar, Trophy, Clock, CheckCircle, 
  Zap, Target, Star, Play, Loader2, ExternalLink, AlertTriangle 
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
  const [showTwitterAlert, setShowTwitterAlert] = useState(false)

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
        // Check if it's a Twitter username error
        if (result?.error === "Twitter username required" || result?.message?.includes("Twitter")) {
          // Show shadcn AlertDialog for missing Twitter username
          setShowTwitterAlert(true)
        } else {
          // Show regular toast for other errors
          toast({
            title: "Failed to join campaign",
            description: result?.message || result?.error || "Please try again later.",
            variant: "destructive"
          })
        }
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
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-4">The requested campaign could not be found.</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <NavBar />
      
      {/* Hero Banner - Full Width */}
      <div className="relative h-64 sm:h-72 lg:h-80 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">

        
        {/* Content Overlay */}
        
        <div className="relative h-full flex flex-col justify-end ml-10 max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={`px-3 py-1.5 text-xs font-semibold backdrop-blur-sm bg-white/20 text-white border-white/30 ${getStatusColor(campaign.status)}`}>
              {campaign.status}
            </Badge>
            {campaign.difficulty && (
              <Badge className={`px-3 py-1.5 text-xs font-semibold backdrop-blur-sm bg-white/20 text-white border-white/30 ${getDifficultyColor(campaign.difficulty)}`}>
                {campaign.difficulty.toUpperCase()}
              </Badge>
            )}
            {campaign.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} className="px-3 py-1.5 text-xs font-medium backdrop-blur-sm bg-white/10 text-white border-white/20">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            {campaign.name}
          </h1>
          
          <p className="text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed drop-shadow-md">
            {campaign.description}
          </p>
        </div>
      </div>

      {/* Main Content - Page Style */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Timeline */}
          <div className="lg:col-span-2 space-y-8">
                  {/* Stats Grid */}
                  <div className="bg-white dark:bg-slate-800 p-6 sm:p-8  shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Campaign Overview</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="group relative bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-5 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/5 group-hover:to-blue-600/10 rounded-xl transition-all duration-300" />
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Participants</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{campaign.currentParticipants}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">of {campaign.participantLimit}</div>
                      </div>

                      <div className="group relative bg-linear-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl p-5 border border-amber-200/50 dark:border-amber-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-br from-amber-400/0 to-amber-600/0 group-hover:from-amber-400/5 group-hover:to-amber-600/10 rounded-xl transition-all duration-300" />
                        <Trophy className="h-8 w-8 text-amber-600 dark:text-amber-400 mb-3" />
                        <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Reward Pool</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{campaign.rewardPool.toLocaleString()}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{campaign.rewardToken}</div>
                      </div>

                      <div className="group relative bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl p-5 border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-br from-emerald-400/0 to-emerald-600/0 group-hover:from-emerald-400/5 group-hover:to-emerald-600/10 rounded-xl transition-all duration-300" />
                        <Calendar className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mb-3" />
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Start Date</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="group relative bg-linear-to-br from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-800/10 rounded-xl p-5 border border-violet-200/50 dark:border-violet-700/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="absolute inset-0 bg-linear-to-br from-violet-400/0 to-violet-600/0 group-hover:from-violet-400/5 group-hover:to-violet-600/10 rounded-xl transition-all duration-300" />
                        <Clock className="h-8 w-8 text-violet-600 dark:text-violet-400 mb-3" />
                        <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">End Date</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Timeline & Schedule</h2>
                    <div className="space-y-4">
                      <div className="group relative bg-white dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Campaign Starts</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(campaign.startDate)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="group relative bg-white dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Campaign Ends</div>
                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{formatDate(campaign.endDate)}</div>
                          </div>
                        </div>
                      </div>

                      {campaign.estimatedDuration && (
                        <div className="group relative bg-white dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="shrink-0 h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estimated Duration</div>
                              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{campaign.estimatedDuration}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Action Card */}
                  <div className="sticky top-6 space-y-6">
                    <div className="bg-linear-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/30 rounded-xl p-6 border border-slate-200 dark:border-slate-600 shadow-lg">
                      {campaign.isJoined ? (
                        <div className="space-y-4">
                          <Button 
                            onClick={handleViewTasks}
                            size="lg"
                            className="w-full h-14 text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                          >
                            <Play className="h-5 w-5 mr-2" />
                            View Campaign Tasks
                          </Button>
                          <div className="flex items-center justify-center gap-2 py-4 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/30">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-bold">Enrolled Successfully</span>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleJoinCampaign}
                          disabled={joining || campaign.status === 'DRAFT'}
                          size="lg"
                          className="w-full h-14 text-base font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
                        >
                          {joining ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Joining Campaign...
                            </>
                          ) : campaign.status === 'DRAFT' ? (
                            'Coming Soon'
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Join This Campaign
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* User Progress */}
                    {campaign.userProgress && (
                      <div className="bg-linear-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl p-6 shadow-xl shadow-purple-500/30 text-white">
                        <div className="text-center">
                          <div className="text-sm font-medium text-white/80 mb-2 uppercase tracking-wide">Your Progress</div>
                          <div className="text-5xl font-bold mb-2">
                            {campaign.userProgress.completedTasks}<span className="text-2xl text-white/70">/{campaign.userProgress.totalTasks}</span>
                          </div>
                          <div className="text-sm text-white/80 mb-4">Tasks Completed</div>
                          <div className="h-px bg-white/20 my-4" />
                          <div className="flex items-center justify-center gap-2">
                            <Star className="h-6 w-6 text-amber-300 fill-amber-300" />
                            <span className="text-2xl font-bold">{campaign.userProgress.earnedXP}</span>
                            <span className="text-sm text-white/80">XP Earned</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Eligibility */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Requirements</h3>
                      </div>
                      <ul className="space-y-3">
                        {campaign.eligibilityCriteria.map((criteria, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="shrink-0 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                              <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Campaign Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Token</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{campaign.rewardToken}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Max Participants</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{campaign.participantLimit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">ID</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{campaign.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
      </div>

      {/* Twitter Username Required Alert Dialog */}
      <AlertDialog open={showTwitterAlert} onOpenChange={setShowTwitterAlert}>
        <AlertDialogContent className="max-w-md border-amber-200 dark:border-amber-800">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 rounded-full ring-8 ring-amber-50 dark:ring-amber-900/20">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">Twitter/X Username Required</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base pt-2">
              You need to add your Twitter/X username to your profile before joining campaigns. 
              This is required to track your social media tasks and verify your participation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 sm:gap-3 pt-6">
            <AlertDialogCancel className="mt-0 sm:mt-0 sm:mr-2 px-6 py-2.5">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowTwitterAlert(false)
                router.push('/dashboard/profile')
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-2.5"
            >
              Go to Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
