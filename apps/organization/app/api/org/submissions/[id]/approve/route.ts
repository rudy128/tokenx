import { NextRequest, NextResponse } from 'next/server'
import { getOrgUserWithOrg, hasPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: submissionId } = await params
  const data = await getOrgUserWithOrg()

  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasPermission(data.membership.permissions as Record<string, boolean> | null, 'can_approve_submissions')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: {
      Task: {
        include: {
          Campaign: true,
        },
      },
    },
  }) as any

  if (!submission || submission.Task.Campaign.organizationId !== data.organization.id) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const updated = await prisma.taskSubmission.update({
    where: { id: submissionId },
    data: { status: 'APPROVED' },
  }) as any

  return NextResponse.json({ success: true, data: updated })
}
