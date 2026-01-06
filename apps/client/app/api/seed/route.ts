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
    // Note: Disabled as Task model requires campaignId
    // const dailyTask1 = await prisma.task.create({ ... })
    
    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      data: {
        campaigns: [campaign1.name, campaign2.name],
        note: 'Task seeding disabled - create tasks through the organization dashboard'
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