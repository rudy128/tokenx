import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface User {
  id: string
  name?: string
  email: string
  role: "ADMIN" | "AMBASSADOR"
  walletAddress?: string
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  xp: number
  tokenBalance: number
  usdtBalance: number
}

interface Campaign {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  participantLimit?: number
  rewardPool: number
  rewardToken: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
}

interface Task {
  id: string
  campaignId: string
  name: string
  description: string
  category: string
  xpReward: number
  verificationMethod: "AI_AUTO" | "MANUAL" | "HYBRID"
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

interface CampaignState {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  setCampaigns: (campaigns: Campaign[]) => void
  setSelectedCampaign: (campaign: Campaign | null) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
}

interface TaskState {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: "auth-store" },
  ),
)

export const useCampaignStore = create<CampaignState>()(
  devtools(
    (set) => ({
      campaigns: [],
      selectedCampaign: null,
      setCampaigns: (campaigns) => set({ campaigns }),
      setSelectedCampaign: (selectedCampaign) => set({ selectedCampaign }),
      addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),
    }),
    { name: "campaign-store" },
  ),
)

export const useTaskStore = create<TaskState>()(
  devtools(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
    }),
    { name: "task-store" },
  ),
)
