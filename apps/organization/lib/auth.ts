import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getOrgUserWithOrg() {
  const { userId } = await auth()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      OrganizationMember: {
        include: {
          organization: true,
        },
      },
    } as any,
  }) as any

  if (!user || !user.OrganizationMember || user.OrganizationMember.length === 0) return null

  const membership = user.OrganizationMember[0]
  return {
    user,
    organization: membership.organization,
    membership,
  }
}

export function hasPermission(permissions: Record<string, boolean> | null, permission: string): boolean {
  return permissions?.[permission] === true
}
