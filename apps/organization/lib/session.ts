import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { OrganizationSession } from "@/lib/auth";

/**
 * Get the current organization member session
 * @returns OrganizationSession | null
 */
export async function getOrganizationSession(): Promise<OrganizationSession | null> {
  const session = await getServerSession(authOptions);
  return session as OrganizationSession | null;
}

/**
 * Get the organization member or throw if not authenticated
 * @returns OrganizationSession
 * @throws Error if not authenticated
 */
export async function requireOrganizationAuth(): Promise<OrganizationSession> {
  const session = await getOrganizationSession();
  
  if (!session || !session.user) {
    throw new Error("Unauthorized: Organization member authentication required");
  }
  
  return session;
}

/**
 * Check if the organization member has a specific role
 * @param session OrganizationSession
 * @param role string
 * @returns boolean
 */
export function hasRole(session: OrganizationSession | null, role: string): boolean {
  if (!session || !session.user) return false;
  return session.user.role === role;
}

/**
 * Check if the organization member has any of the specified roles
 * @param session OrganizationSession
 * @param roles string[]
 * @returns boolean
 */
export function hasAnyRole(session: OrganizationSession | null, roles: string[]): boolean {
  if (!session || !session.user) return false;
  return roles.includes(session.user.role);
}
