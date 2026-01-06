import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/auth-helpers"

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId, dbUser) => {
    try {
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      // Return user profile data
      return NextResponse.json({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        image: dbUser.image,
        role: dbUser.role,
        walletAddress: dbUser.walletAddress,
        twitterUsername: dbUser.twitterUsername,
        tier: dbUser.tier,
        xp: dbUser.xp,
        tokenBalance: dbUser.tokenBalance,
        usdtBalance: dbUser.usdtBalance,
        isBanned: dbUser.isBanned,
        createdAt: dbUser.createdAt
      })
    } catch (error) {
      console.error("❌ Error fetching profile:", error)
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      )
    }
  })
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  return withAuth(request, async (userId, dbUser) => {
    try {
      if (!dbUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        )
      }

      const body = await request.json()
      const { name, twitterUsername, walletAddress } = body

      // Validate twitter username format if provided
      if (twitterUsername) {
        const cleanUsername = twitterUsername.replace('@', '').trim()
        if (cleanUsername && !/^[A-Za-z0-9_]{1,15}$/.test(cleanUsername)) {
          return NextResponse.json(
            { error: "Invalid Twitter username format" },
            { status: 400 }
          )
        }
      }

      // Validate wallet address format if provided
      if (walletAddress) {
        const cleanAddress = walletAddress.trim()
        if (cleanAddress && !/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
          return NextResponse.json(
            { error: "Invalid wallet address format" },
            { status: 400 }
          )
        }
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || dbUser.name,
          twitterUsername: twitterUsername ? twitterUsername.replace('@', '').trim() : dbUser.twitterUsername,
          walletAddress: walletAddress ? walletAddress.trim() : dbUser.walletAddress,
          updatedAt: new Date()
        }
      })

      console.log("✅ Profile updated successfully for user:", userId)

      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        role: updatedUser.role,
        walletAddress: updatedUser.walletAddress,
        twitterUsername: updatedUser.twitterUsername,
        tier: updatedUser.tier,
        xp: updatedUser.xp,
        tokenBalance: updatedUser.tokenBalance,
        usdtBalance: updatedUser.usdtBalance,
        isBanned: updatedUser.isBanned,
        createdAt: updatedUser.createdAt
      })
    } catch (error) {
      console.error("❌ Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }
  })
}

