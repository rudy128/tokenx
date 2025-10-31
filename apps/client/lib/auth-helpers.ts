import { auth } from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Get the authenticated user's database record
 * @param userId The NextAuth user ID
 * @returns The database user record or null
 */
async function getDbUserFromUserId(userId: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // If user not found by ID, try to find by other means and sync
    if (!user) {
      console.log("🔍 User not found by ID, attempting to find and sync user:", userId)
      
      // Try to find user in Account table (for OAuth users)
      const account = await prisma.account.findFirst({
        where: { userId: userId },
        include: { User: true }
      })

      if (account?.User) {
        user = account.User
        console.log("✅ Found user via Account table:", user.email)
      } else {
        // Try to find user in Session table
        const session = await prisma.session.findFirst({
          where: { userId: userId },
          include: { User: true }
        })

        if (session?.User) {
          user = session.User
          console.log("✅ Found user via Session table:", user.email)
        }
      }
    }

    if (user) {
      // Update last sign in
      await prisma.user.update({
        where: { id: userId },
        data: { lastSignedIn: new Date() }
      })
    }

    return user
  } catch (error) {
    console.error("Error finding user by ID:", error)
    return null
  }
}

/**
 * Authentication helper for API routes
 * @param request The NextRequest object
 * @param callback Function to execute if user is authenticated
 * @returns Response from callback or 401 Unauthorized
 */
export async function withAuth(
  request: NextRequest,
  callback: (userId: string, user: any) => Promise<NextResponse>
) {
  try {
    console.log("🔍 withAuth: Starting authentication check...")
    const session = await auth()
    console.log("🔍 withAuth: Session retrieved:", session ? "✅ Valid session" : "❌ No session")
    
    const userId = session?.user?.id

    if (!userId) {
      console.log("❌ withAuth: No user ID found in session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 withAuth: User ID found:", userId)
    
    // Get the database user
    const user = await getDbUserFromUserId(userId)
    console.log("🔍 withAuth: Database user lookup:", user ? "✅ User found" : "❌ User not found")

    if (!user) {
      console.log("❌ withAuth: Database user not found for ID:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("✅ withAuth: Authentication successful, proceeding with callback")
    return await callback(userId, user)
  } catch (error) {
    console.error("❌ withAuth: Auth error:", error)
    return NextResponse.json({ error: "Authentication error" }, { status: 401 })
  }
}

/**
 * Get current user information (for server components)
 */
export async function getCurrentUser() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return null
    }

    const user = await getDbUserFromUserId(session.user.id)
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Require authentication for server components
 * Throws an error if user is not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

