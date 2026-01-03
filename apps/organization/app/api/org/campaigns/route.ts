import { NextRequest, NextResponse } from 'next/server'
import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const data = await getOrgUserWithOrg()
  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const campaigns = await prisma.campaign.findMany({
    where: { Organization: { id: data.organization.id } } as any,
    include: {
      Tasks: {
        select: { id: true },
      },
    } as any,
  }) as any[]

  return NextResponse.json({ success: true, data: campaigns })
}

export async function POST(request: NextRequest) {
  const data = await getOrgUserWithOrg()
  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(data.membership.permissions as Record<string, boolean> | null, 'can_create_campaigns')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const { name, description, startDate, endDate, rewardPool } = await request.json()

  if (!name || !startDate || !endDate || rewardPool === undefined) {
    return NextResponse.json({ error: 'Campaign name, dates, and reward pool are required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rewardPool: parseFloat(rewardPool),
      status: 'ACTIVE',
      createdByRole: 'ORGANIZATION',
      Creator: {
        connect: { id: data.user.id },
      },
      Organization: {
        connect: { id: data.organization.id },
      },
    } as any,
  }) as any

  return NextResponse.json({ success: true, data: campaign }, { status: 201 })
}
