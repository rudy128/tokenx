import { auth, currentUser, type User as ClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

function emailInAdminList(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/**
 * Return true if the current authenticated user is an admin.
 * Checks Clerk publicMetadata first, then falls back to database role by clerkId.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  if (!user) return false;

  const metaRole = typeof user.publicMetadata?.role === "string"
    ? String(user.publicMetadata.role).toUpperCase()
    : undefined;
  if (metaRole === "ADMIN") return true;

  try {
    // First, try by clerkId
    let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (dbUser && typeof dbUser.role === "string" && dbUser.role.toUpperCase() === "ADMIN") {
      return true;
    }

    // Fallback: try by primary email if clerkId mapping not found
    const primaryEmail = user.primaryEmailAddress?.emailAddress
      || user.emailAddresses?.[0]?.emailAddress
      || undefined;
    if (primaryEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: primaryEmail } });
      if (dbUser && typeof dbUser.role === "string" && dbUser.role.toUpperCase() === "ADMIN") {
        return true;
      }
      // Env-based admin allowlist
      if (emailInAdminList(primaryEmail)) {
        // Promote and persist
        if (dbUser) {
          if (dbUser.role !== "ADMIN") {
            await prisma.user.update({ where: { id: dbUser.id }, data: { role: "ADMIN", clerkId: dbUser.clerkId || user.id } });
          } else if (!dbUser.clerkId) {
            await prisma.user.update({ where: { id: dbUser.id }, data: { clerkId: user.id } });
          }
        } else {
          await prisma.user.create({
            data: {
              clerkId: user.id,
              email: primaryEmail,
              name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Admin User",
              image: user.imageUrl || null,
              role: "ADMIN",
              tier: "BRONZE",
              xp: 0,
              tokenBalance: 0,
              usdtBalance: 0,
              lastSignedIn: new Date(),
            }
          });
        }
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

/**
 * Get the current authenticated user from the database (by clerkId).
 */
export async function getCurrentDbUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    return await prisma.user.findUnique({ where: { clerkId: user.id } });
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Throw if no authenticated admin.
 */
export async function requireAdmin() {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Authentication required");
  if (String(user.role).toUpperCase() !== "ADMIN") throw new Error("Admin privileges required");
  return user;
}

/**
 * Sync a Clerk user to the database (create or update) and return the DB user.
 */
export async function syncUserToDatabase(clerkUser: ClerkUser) {
  if (!clerkUser || !clerkUser.id) {
    throw new Error("Invalid Clerk user data");
  }

  try {
    const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress
      || clerkUser.emailAddresses?.[0]?.emailAddress
      || undefined;
    const metaRole = typeof clerkUser.publicMetadata?.role === "string"
      ? String(clerkUser.publicMetadata.role).toUpperCase()
      : undefined;
  const desiredRole = metaRole === "ADMIN" || emailInAdminList(primaryEmail) ? "ADMIN" : "AMBASSADOR";

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (existingUser) {
      const update: any = {
        where: { clerkId: clerkUser.id },
        data: {
          email: primaryEmail ?? existingUser.email,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingUser.name || "New User",
          image: clerkUser.imageUrl || existingUser.image || null,
          lastSignedIn: new Date(),
        },
      };
      // If metadata says ADMIN but DB role isn't ADMIN yet, promote
      if (desiredRole === "ADMIN" && existingUser.role !== "ADMIN") {
        update.data.role = "ADMIN";
      }
      return await prisma.user.update(update);
    }

    // Link by email if an account already exists without clerkId
    if (primaryEmail) {
      const byEmail = await prisma.user.findUnique({ where: { email: primaryEmail } });
      if (byEmail) {
        const update: any = {
          where: { id: byEmail.id },
          data: {
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || byEmail.name || "New User",
            image: clerkUser.imageUrl || byEmail.image || null,
            lastSignedIn: new Date(),
          },
        };
        // Only promote to ADMIN, never demote
        if (desiredRole === "ADMIN" && byEmail.role !== "ADMIN") {
          update.data.role = "ADMIN";
        }
        return await prisma.user.update(update);
      }
    }

    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: primaryEmail || `user-${clerkUser.id}-${Date.now()}@clerk.local`,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "New User",
        image: clerkUser.imageUrl || null,
        role: desiredRole,
        tier: "BRONZE",
        xp: 0,
        tokenBalance: 0,
        usdtBalance: 0,
        lastSignedIn: new Date(),
      },
    });
  } catch (error) {
    console.error("Error syncing user to database:", error);
    throw error;
  }
}

/** True if the request is authenticated. */
export async function isAuthenticated() {
  const session = await auth();
  return !!session.userId;
}

/**
 * Check admin role via Clerk metadata then DB.
 */
export async function checkAdminRole() {
  const user = await currentUser();
  if (!user) return false;
  const metaRole = typeof user.publicMetadata?.role === "string"
    ? String(user.publicMetadata.role).toUpperCase()
    : undefined;
  if (metaRole === "ADMIN") return true;
  try {
    // First, try by clerkId
    let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (dbUser?.role === "ADMIN") return true;

    // Fallback by email
    const primaryEmail = user.primaryEmailAddress?.emailAddress
      || user.emailAddresses?.[0]?.emailAddress
      || undefined;
    if (primaryEmail) {
      dbUser = await prisma.user.findUnique({ where: { email: primaryEmail } });
  if (dbUser?.role === "ADMIN") return true;
  if (emailInAdminList(primaryEmail)) return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}