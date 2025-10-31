import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the actual params object
    const resolvedParams = await params
    const taskId = resolvedParams.id

    // Try to fetch actual task from database
    let task = null
    try {
      task = await prisma.newTask.findUnique({
        where: { id: taskId },
        include: {
          submissions: {
            select: {
              status: true,
              userId: true
            }
          }
        }
      })
    } catch (dbError) {
      console.log('Database query failed, using mock data:', dbError)
    }

    // If actual task found, return it
    if (task) {
      const transformedTask = {
        id: task.id,
        name: task.name,
        description: task.description,
        banner: (task as any).banner ?? undefined,
        platform: (task as any).platform ?? undefined,
        platformLogo: (task as any).platformLogo ?? undefined,
        campaign: (task as any).campaign ?? undefined,
        instructions: task.instructions,
        actionUrl: (task as any).actionUrl ?? task.instructions ?? undefined,
        xp: task.xp,
        frequency: task.frequency,
        status: task.status,
        rewardOverride: task.rewardOverride,
        rewardToken: task.rewardToken,
        rewardAmount: task.rewardAmount,
        perUserCap: task.perUserCap,
        globalCap: task.globalCap,
        availableFrom: task.availableFrom,
        availableTo: task.availableTo,
        submissionCutoff: task.submissionCutoff,
        evidenceMode: task.evidenceMode,
        approvalWorkflow: task.approvalWorkflow,
        verificationMode: task.approvalWorkflow === 'auto' ? 'AUTO' : 'MANUAL',
        uniqueContent: task.uniqueContent,
        minAccountAgeDays: task.minAccountAgeDays,
        minFollowers: task.minFollowers,
        createdAt: task.createdAt,
        submissions: task.submissions,
        taskType: (task as any).taskType ?? 'GENERAL',
        steps: (task as any).steps || [],
        referrals: (task as any).referrals || undefined,
        contract: (task as any).contract || undefined,
        contractAddress: (task as any).contractAddress || undefined
      }

      return NextResponse.json(transformedTask)
    }

    // Fallback to mock data if no actual task found
    const mockTask = {
      id: taskId,
      name: "Daily Social Engagement",
      description: "Engage with our community on social media platforms",
      banner: undefined,
      platform: "Twitter",
      platformLogo: undefined,
      campaign: "Daily Tasks",
      instructions: "Like, retweet, and comment on our latest post",
      actionUrl: "https://x.com/CubaneSpace",
      xp: 50,
      frequency: "daily",
      status: "active",
      rewardOverride: false,
      rewardToken: null,
      rewardAmount: null,
      perUserCap: 1,
      globalCap: null,
      availableFrom: new Date(),
      availableTo: null,
      submissionCutoff: null,
      evidenceMode: "MANUAL",
      approvalWorkflow: "manual",
      verificationMode: "MANUAL",
      uniqueContent: false,
      minAccountAgeDays: null,
      minFollowers: null,
      createdAt: new Date(),
      submissions: [],
      taskType: "SOCIAL_ENGAGEMENT",
      steps: [],
      referrals: undefined,
      contract: undefined,
      contractAddress: undefined
    }

    return NextResponse.json(mockTask)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}