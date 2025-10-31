'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getMyActiveTasks() {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated', tasks: [] }
  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!dbUser) return { success: false, error: 'User not found in DB', tasks: [] }

  const participations = await prisma.campaignParticipation.findMany({
    where: { userId: dbUser.id, status: 'APPROVED' },
    select: { campaignId: true },
  })
  const campaignIds = participations.map((p: { campaignId: string }) => p.campaignId)

  const where: any = {}
  if (campaignIds.length) where.campaignId = { in: campaignIds }
  where.status = 'active'

  const tasks = await (prisma as any).task.findMany({
    where,
    include: {
      Campaign: { select: { name: true, endDate: true } },
      TaskSubmission: { where: { userId: dbUser.id }, take: 1, select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 150,
  })

  return { success: true, tasks, userId: dbUser.id }
}
