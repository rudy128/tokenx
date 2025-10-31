import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  // Disable GET access to prevent accidental seeding
  return NextResponse.json({
    error: "Method not allowed",
    message: "Seed endpoint is only available via POST with proper authorization"
  }, { status: 405 })
}

export async function POST(request: NextRequest) {
  // Only allow seeding in development or with explicit authorization
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.SEED_API_TOKEN
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({
        error: "Unauthorized",
        message: "Seed endpoint requires proper authorization in production"
      }, { status: 401 })
    }
  }
  try {
    console.log('🌱 Seeding sample data...')
    console.log('⚠️  WARNING: This will create/update sample data in the database')

    // Create admin user if not exists
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@tokenx.com' },
      update: {},
      create: {
        id: 'admin-user',
        email: 'admin@tokenx.com',
        name: 'Admin User',
        role: 'ADMIN',
        tier: 'PLATINUM',
        xp: 0,
        tokenBalance: 0,
        usdtBalance: 0
      }
    })

    // Create sample campaigns
    const campaign1 = await prisma.campaign.upsert({
      where: { id: 'campaign-1' },
      update: {},
      create: {
        id: 'campaign-1',
        name: 'Social Media Engagement Campaign',
        description: 'Promote TokenX across social media platforms',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        participantLimit: 100,
        eligibilityCriteria: 'Must have active social media accounts',
        rewardPool: 5000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const campaign2 = await prisma.campaign.upsert({
      where: { id: 'campaign-2' },
      update: {},
      create: {
        id: 'campaign-2',
        name: 'Community Building Initiative',
        description: 'Help grow the TokenX community through various activities',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        participantLimit: 50,
        eligibilityCriteria: 'Must be active community member',
        rewardPool: 3000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create sample daily tasks
    const dailyTask1 = await prisma.newTask.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Daily Check-in',
        taskType: 'SOCIAL_MEDIA',
        description: 'Complete your daily check-in to earn XP',
        instructions: 'Simply click the check-in button to complete this task',
        status: 'active',
        xp: 10,
        frequency: 'daily',
        evidenceMode: 'auto',
        approvalWorkflow: 'auto',
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const dailyTask2 = await prisma.newTask.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440002' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Follow TokenX on Twitter',
        taskType: 'SOCIAL_MEDIA',
        description: 'Follow @TokenX on Twitter to stay updated',
        instructions: 'Follow @TokenX on Twitter and provide a screenshot as proof',
        status: 'active',
        xp: 50,
        frequency: 'one_time',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual',
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const dailyTask3 = await prisma.newTask.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440003' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Share TokenX Post',
        taskType: 'CONTENT_CREATION',
        description: 'Share a TokenX post on your social media',
        instructions: 'Share any TokenX post on Twitter, Facebook, or LinkedIn with proper attribution',
        status: 'active',
        xp: 75,
        frequency: 'daily',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual',
        perUserCap: 1,
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      data: {
        campaigns: [campaign1.name, campaign2.name],
        dailyTasks: [dailyTask1.name, dailyTask2.name, dailyTask3.name]
      }
    })

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}