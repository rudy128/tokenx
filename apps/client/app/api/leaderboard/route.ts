import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Get total count
    const totalUsers = await prisma.user.count({
      where: {
        xp: {
          gt: 0
        }
      }
    })

    // Get leaderboard users sorted by XP
    const users = await prisma.user.findMany({
      where: {
        xp: {
          gt: 0
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        xp: true,
        tier: true
      },
      orderBy: {
        xp: 'desc'
      },
      skip,
      take: limit
    })

    // Add rank to each user
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1
    }))

    return NextResponse.json({
      users: usersWithRank,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page
    })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" }, 
      { status: 500 }
    )
  }
}