import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withAuth } from "@/lib/auth-helpers"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  criteria: {
    type: "TASKS_COMPLETED" | "XP_EARNED" | "CAMPAIGNS_JOINED" | "STREAK_DAYS" | "SOCIAL_ENGAGEMENT"
    target: number
    category?: string
  }
  reward: {
    xp: number
    token?: string
    amount?: number
  }
}

const AVAILABLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first task",
    icon: "🎯",
    tier: "BRONZE",
    criteria: { type: "TASKS_COMPLETED", target: 1 },
    reward: { xp: 50 },
  },
  {
    id: "task_master",
    name: "Task Master",
    description: "Complete 10 tasks",
    icon: "⚡",
    tier: "BRONZE",
    criteria: { type: "TASKS_COMPLETED", target: 10 },
    reward: { xp: 100, token: "NATIVE", amount: 50 },
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Complete 10 social engagement tasks",
    icon: "🦋",
    tier: "SILVER",
    criteria: { type: "TASKS_COMPLETED", target: 10, category: "Social Engagement" },
    reward: { xp: 200, token: "USDT", amount: 5 },
  },
  {
    id: "content_creator",
    name: "Content Creator",
    description: "Create 5 pieces of original content",
    icon: "🎨",
    tier: "GOLD",
    criteria: { type: "TASKS_COMPLETED", target: 5, category: "Content Creation" },
    reward: { xp: 300, token: "USDT", amount: 15 },
  },
  {
    id: "xp_collector",
    name: "XP Collector",
    description: "Earn 1000 XP",
    icon: "💎",
    tier: "SILVER",
    criteria: { type: "XP_EARNED", target: 1000 },
    reward: { xp: 150, token: "NATIVE", amount: 100 },
  },
  {
    id: "ambassador_elite",
    name: "Ambassador Elite",
    description: "Reach 5000 XP across all campaigns",
    icon: "👑",
    tier: "PLATINUM",
    criteria: { type: "XP_EARNED", target: 5000 },
    reward: { xp: 500, token: "USDT", amount: 50 },
  },
  {
    id: "campaign_explorer",
    name: "Campaign Explorer",
    description: "Join 5 different campaigns",
    icon: "🗺️",
    tier: "SILVER",
    criteria: { type: "CAMPAIGNS_JOINED", target: 5 },
    reward: { xp: 200, token: "NATIVE", amount: 200 },
  },
]

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session.userId

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { triggerType, value, category } = body

    // Get user's current stats
    const userStats = await getUserStats(userId)

    // Check for newly unlocked achievements
    const newAchievements = await checkAchievements(userStats, triggerType, value, category)

    // Award achievements
    const awardedAchievements = []
    for (const achievement of newAchievements) {
      const awarded = await awardAchievement(userId, achievement)
      if (awarded) {
        awardedAchievements.push(achievement)
      }
    }

    return NextResponse.json({
      success: true,
      newAchievements: awardedAchievements,
      totalUnlocked: userStats.unlockedAchievements.length + awardedAchievements.length,
    })
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

async function getUserStats(userId: string) {
  // Mock user stats - replace with actual database queries
  return {
    totalXP: 1650,
    completedTasks: 18,
    tasksPerCategory: {
      "Social Engagement": 8,
      "Content Creation": 3,
      "Video Content": 2,
      Community: 5,
    },
    campaignsJoined: 3,
    streakDays: 7,
    unlockedAchievements: ["first_steps", "task_master", "social_butterfly"],
  }
}

async function checkAchievements(
  userStats: any,
  triggerType: string,
  value: number,
  category?: string,
): Promise<Achievement[]> {
  const newAchievements: Achievement[] = []

  for (const achievement of AVAILABLE_ACHIEVEMENTS) {
    // Skip if already unlocked
    if (userStats.unlockedAchievements.includes(achievement.id)) {
      continue
    }

    let qualifies = false

    switch (achievement.criteria.type) {
      case "TASKS_COMPLETED":
        if (achievement.criteria.category) {
          qualifies = (userStats.tasksPerCategory[achievement.criteria.category] || 0) >= achievement.criteria.target
        } else {
          qualifies = userStats.completedTasks >= achievement.criteria.target
        }
        break

      case "XP_EARNED":
        qualifies = userStats.totalXP >= achievement.criteria.target
        break

      case "CAMPAIGNS_JOINED":
        qualifies = userStats.campaignsJoined >= achievement.criteria.target
        break

      case "STREAK_DAYS":
        qualifies = userStats.streakDays >= achievement.criteria.target
        break

      default:
        break
    }

    if (qualifies) {
      newAchievements.push(achievement)
    }
  }

  return newAchievements
}

async function awardAchievement(userId: string, achievement: Achievement): Promise<boolean> {
  try {
    // Mock achievement awarding - replace with actual database operations
    console.log(`Awarding achievement "${achievement.name}" to user ${userId}`)

    // Award XP bonus
    if (achievement.reward.xp > 0) {
      await updateUserXP(userId, achievement.reward.xp)
    }

    // Award token bonus
    if (achievement.reward.token && achievement.reward.amount) {
      await updateUserBalance(userId, achievement.reward.amount, achievement.reward.token)
    }

    // Record achievement unlock
    await recordAchievementUnlock(userId, achievement.id)

    return true
  } catch (error) {
    console.error(`Failed to award achievement ${achievement.id} to user ${userId}:`, error)
    return false
  }
}

async function updateUserXP(userId: string, xpBonus: number) {
  console.log(`Adding ${xpBonus} XP bonus to user ${userId}`)
}

async function updateUserBalance(userId: string, amount: number, token: string) {
  console.log(`Adding ${amount} ${token} bonus to user ${userId}`)
}

async function recordAchievementUnlock(userId: string, achievementId: string) {
  console.log(`Recording achievement unlock: ${achievementId} for user ${userId}`)
}
