"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/NavBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, Mail, Wallet, Twitter, Trophy, Star, 
  Edit2, Save, X, Loader2, ShieldCheck, Diamond, Zap 
} from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  walletAddress: string | null
  twitterUsername: string | null
  tier: string
  xp: number
  tokenBalance: number
  usdtBalance: number
  isBanned: boolean
  createdAt: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    twitterUsername: "",
    walletAddress: ""
  })

  useEffect(() => {
    if (!session) {
      router.push("/sign-in")
      return
    }
    fetchProfile()
  }, [session, router])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/profile")
      if (!res.ok) throw new Error("Failed to fetch profile")
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || "",
        twitterUsername: data.twitterUsername || "",
        walletAddress: data.walletAddress || ""
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update profile")
      }

      const updatedProfile = await res.json()
      setProfile(updatedProfile)
      setEditing(false)

      toast({
        title: "Success",
        description: "Your profile has been updated successfully."
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      twitterUsername: profile?.twitterUsername || "",
      walletAddress: profile?.walletAddress || ""
    })
    setEditing(false)
  }

  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1
  }

  const getNextLevelXp = (xp: number) => {
    const currentLevel = calculateLevel(xp)
    return currentLevel * 100
  }

  const getLevelProgress = (xp: number) => {
    const currentLevelXp = (calculateLevel(xp) - 1) * 100
    const nextLevelXp = getNextLevelXp(xp)
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400">Profile not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <NavBar />
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-200 h-150 bg-blue-900/20 rounded-[100%] blur-[120px]" />
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-150 h-100 bg-purple-900/10 rounded-[100%] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center pt-20">
          {/* Profile Card */}
          <div className="flex flex-col items-center w-full mb-8">
            {/* Avatar Container with Glow Rings */}
            <div className="relative mb-6">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-slate-800/60 scale-[1.8]" />
              <div className="absolute inset-0 rounded-full border border-slate-800/40 scale-[2.4]" />
              <div className="absolute inset-0 rounded-full border border-slate-800/20 scale-[3.0]" />
              
              <div className="h-32 w-32 rounded-full p-1 bg-linear-to-b from-slate-700 to-black relative z-10">
                <div className="h-full w-full rounded-full overflow-hidden bg-black relative">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-800">
                      <User className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1.5 border-4 border-black">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Name & Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {editing ? (
                 <Input 
                   value={formData.name} 
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="text-center bg-transparent border-slate-700 text-2xl h-12 w-64 mx-auto"
                 />
              ) : (
                profile.name || "Ambassador"
              )}
            </h1>

            {/* Stats Pills */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-sm font-medium text-slate-300">{profile.xp} XPs</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-full px-4 py-1.5">
                <Diamond className="h-3 w-3 text-purple-400 fill-purple-400" />
                <span className="text-sm font-medium text-slate-300">0 GEMS</span>
              </div>
            </div>
            
            {/* Social Pill */}
            <div className="mb-8">
              {editing ? (
                <Input
                   value={formData.twitterUsername}
                   onChange={(e) => setFormData({...formData, twitterUsername: e.target.value})}
                   placeholder="Twitter Username"
                   className="bg-slate-900/50 border-slate-800 text-center w-64 mx-auto"
                />
              ) : (
                profile.twitterUsername && (
                  <div className="inline-flex items-center gap-2 bg-[#5d7dcb] text-white px-4 py-1.5 rounded-full text-sm font-medium">
                    <Twitter className="h-3 w-3 fill-current" />
                    @{profile.twitterUsername}
                  </div>
                )
              )}
            </div>

            {/* Level Progress */}
            <div className="max-w-md w-full mx-auto mb-16">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-white">Level {calculateLevel(profile.xp)}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{getNextLevelXp(profile.xp)} XPs</span>
              </div>
              <Progress value={getLevelProgress(profile.xp)} className="h-2 bg-zinc-800" indicatorClassName="bg-white" />
              <div className="flex justify-between mt-2 text-xs text-zinc-500">
                <span>{profile.xp}</span>
                <span>{getNextLevelXp(profile.xp)}</span>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-transparent">
            <Tabs defaultValue="quests" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-zinc-900/50 border border-white/5 h-auto p-1 rounded-full">
                  <TabsTrigger value="quests" className="rounded-full px-6 py-2 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white mb-0">Completed Quests</TabsTrigger>
                  <TabsTrigger value="nfts" className="rounded-full px-6 py-2 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white mb-0">NFTs Minted</TabsTrigger>
                  <TabsTrigger value="rewards" className="rounded-full px-6 py-2 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white mb-0">Rewards</TabsTrigger>
                  <TabsTrigger value="loyalty" className="rounded-full px-6 py-2 text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-white mb-0">Loyalty Points</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="quests" className="text-center py-20">
                <p className="text-zinc-500 italic">No completed campaigns</p>
              </TabsContent>
              
              <TabsContent value="nfts" className="text-center py-20">
                <p className="text-zinc-500 italic">No NFTs minted yet</p>
              </TabsContent>

              <TabsContent value="rewards" className="text-center py-20">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                   <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col items-center">
                      <span className="text-zinc-400 mb-2">Token Balance</span>
                      <span className="text-2xl font-bold text-white">{profile.tokenBalance}</span>
                   </div>
                   <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6 flex flex-col items-center">
                      <span className="text-zinc-400 mb-2">USDT Balance</span>
                      <span className="text-2xl font-bold text-white">${profile.usdtBalance}</span>
                   </div>
                 </div>
              </TabsContent>

              <TabsContent value="loyalty" className="text-center py-20">
               <div className="inline-flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-900/20 border border-white/5">
                 <Trophy className="h-12 w-12 text-yellow-500 mb-4 opacity-50" />
                 <span className="text-3xl font-bold text-white mb-1">0</span>
                 <span className="text-sm text-zinc-500 uppercase tracking-widest">Points</span>
               </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
