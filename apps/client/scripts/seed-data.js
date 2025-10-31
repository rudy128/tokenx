const { prisma } = require('@repo/shared-utils')

async function seedData() {
  try {
    console.log('🌱 Seeding sample data...')

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
        createdById: 'admin-user',
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
        createdById: 'admin-user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Created campaigns:', campaign1.name, campaign2.name)

    // Create sample tasks for campaign 1
    const task1 = await prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        campaignId: 'campaign-1',
        name: 'Share TokenX announcement on Twitter',
        description: 'Share the latest TokenX announcement on your Twitter account with #TokenX hashtag',
        category: 'SOCIAL_ENGAGEMENT',
        xpReward: 100,
        verificationMethod: 'MANUAL',
        requirements: {
          platform: 'Twitter',
          hashtags: ['#TokenX', '#DeFi'],
          minFollowers: 50
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    const task2 = await prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        campaignId: 'campaign-1',
        name: 'Create TokenX content video',
        description: 'Create a short video explaining TokenX features and benefits',
        category: 'CONTENT_CREATION',
        xpReward: 250,
        verificationMethod: 'MANUAL',
        requirements: {
          duration: '30-60 seconds',
          platform: 'Any',
          quality: 'HD'
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Created campaign tasks:', task1.name, task2.name)

    // Create sample daily tasks
    const dailyTask1 = await prisma.newTask.upsert({
      where: { id: 'daily-task-1' },
      update: {},
      create: {
        id: 'daily-task-1',
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
      where: { id: 'daily-task-2' },
      update: {},
      create: {
        id: 'daily-task-2',
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
      where: { id: 'daily-task-3' },
      update: {},
      create: {
        id: 'daily-task-3',
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

    console.log('✅ Created daily tasks:', dailyTask1.name, dailyTask2.name, dailyTask3.name)

    console.log('🎉 Sample data seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()