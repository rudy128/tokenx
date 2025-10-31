import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Maps a Clerk user ID to the internal database user ID
 * Creates a user if one doesn't exist
 * @param clerkId The Clerk user ID
 * @returns The database user ID
 */
async function getDbUserIdFromClerkId(clerkId: string): Promise<string | null> {
  try {
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    // If user doesn't exist, check if there's an existing user with same email and link them
    if (!user && clerkId) {
      console.log("User not found in database, checking for existing account for Clerk ID:", clerkId);
      
      try {
        // Fetch user details from Clerk
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(clerkId);
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
        
        if (userEmail) {
          // Check if there's already a user with this email but no clerkId
          const existingUserWithEmail = await prisma.user.findUnique({
            where: { email: userEmail }
          });
          
          if (existingUserWithEmail && !existingUserWithEmail.clerkId) {
            console.log("📧 Found existing user with same email, linking to Clerk account:", existingUserWithEmail.id);
            
            // Update the existing user to link with Clerk account
            user = await prisma.user.update({
              where: { id: existingUserWithEmail.id },
              data: {
                clerkId: clerkId,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || existingUserWithEmail.name,
                image: clerkUser.imageUrl || existingUserWithEmail.image,
                lastSignedIn: new Date(),
              }
            });
            
            console.log("✅ Successfully linked existing user to Clerk account:", user.id);
          } else if (existingUserWithEmail && existingUserWithEmail.clerkId) {
            console.log("⚠️ User with this email already has a different Clerk ID:", existingUserWithEmail.clerkId);
            return existingUserWithEmail.id;
          } else {
            // Create completely new user
            user = await prisma.user.create({
              data: {
                clerkId: clerkId,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
                email: userEmail,
                image: clerkUser.imageUrl || null,
                role: 'AMBASSADOR', // Default role
                tier: 'BRONZE',     // Default tier
                xp: 0,
                tokenBalance: 0,
                usdtBalance: 0,
                lastSignedIn: new Date(),
              }
            });
            
            console.log("✅ Successfully created new user in database:", user.id);
          }
        } else {
          // No email from Clerk, create with generated email
          user = await prisma.user.create({
            data: {
              clerkId: clerkId,
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
              email: `user-${clerkId}-${Date.now()}@clerk-generated.com`,
              image: clerkUser.imageUrl || null,
              role: 'AMBASSADOR',
              tier: 'BRONZE',
              xp: 0,
              tokenBalance: 0,
              usdtBalance: 0,
              lastSignedIn: new Date(),
            }
          });
          
          console.log("✅ Created user without email from Clerk:", user.id);
        }
        
      } catch (createError) {
        console.error("❌ Failed to create or link user:", createError);
        
        // Final fallback: create with completely unique data
        try {
          user = await prisma.user.create({
            data: {
              clerkId: clerkId,
              name: 'New User',
              email: `fallback-${clerkId}-${Date.now()}@example.com`,
              role: 'AMBASSADOR',
              tier: 'BRONZE',
              xp: 0,
              tokenBalance: 0,
              usdtBalance: 0,
              lastSignedIn: new Date(),
            }
          });
          
          console.log("✅ Created user with fallback data:", user.id);
        } catch (fallbackError) {
          console.error("❌ Complete failure to create user:", fallbackError);
          return null;
        }
      }
    }
    
    return user?.id || null;
  } catch (error) {
    console.error("Error finding or creating user by clerkId:", error);
    return null;
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
  callback: (userId: string, dbUserId: string | null) => Promise<NextResponse>
) {
  try {
    const session = await auth();
    const clerkId = session.userId;
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the database user ID
    const dbUserId = await getDbUserIdFromClerkId(clerkId);
    
    return await callback(clerkId, dbUserId);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 401 });
  }
}

/**
 * Authentication helper for API routes with admin check
 * @param request The NextRequest object
 * @param callback Function to execute if user is authenticated and is an admin
 * @returns Response from callback or 401/403 error
 */
export async function withAdminAuth(
  request: NextRequest, 
  callback: (userId: string, dbUserId: string) => Promise<NextResponse>
) {
  try {
    const session = await auth();
    const clerkId = session.userId;
    
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { clerkId }
    });
    
    if (!dbUser || dbUser.role.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    
    return await callback(clerkId, dbUser.id);
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 401 });
  }
}
