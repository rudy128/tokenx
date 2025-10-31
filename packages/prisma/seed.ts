import { PrismaClient } from '@prisma/client'

// Node.js global types
declare const process: {
  exit: (code?: number) => never
}

const prisma = new PrismaClient()

async function main() {
  // Using simple passwords for testing (no hashing to avoid dependency issues)
  const adminPassword = 'admin_password_hash'
  const userPassword = 'user_password_hash'

  // Create admin user (username: admin, password: admin)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: 'admin_user_id_001',
      email: 'admin@example.com',
      name: 'Admin User',
      clerkId: 'admin_clerk_id',
      password: adminPassword,
      role: 'ADMIN',
      tier: 'PLATINUM',
      xp: 10000,
      tokenBalance: 1000.0,
      usdtBalance: 500.0,
    },
  })

  // Create ambassador user (username: user, password: user)  
  const ambassador = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      id: 'ambassador_user_id_002',
      email: 'user@example.com',
      name: 'Ambassador User',
      clerkId: 'user_clerk_id',
      password: userPassword,
      role: 'AMBASSADOR',
      tier: 'BRONZE',
      xp: 100,
      tokenBalance: 50.0,
      usdtBalance: 25.0,
    },
  })

  // Create sample campaigns
  const campaign1 = await prisma.campaign.upsert({
    where: { id: 'sample-campaign-1' },
    update: {},
    create: {
      id: 'sample-campaign-1',
      name: 'Summer Social Media Campaign',
      description: 'Promote our summer collection across social platforms and earn rewards for engagement. Share content, engage with our community, and help us reach new audiences.',
      startDate: new Date('2024-06-01T00:00:00Z'),
      endDate: new Date('2024-12-31T23:59:59Z'),
      participantLimit: 100,
      eligibilityCriteria: JSON.stringify([
        "Minimum 1000 followers on at least one platform", 
        "Active social media presence", 
        "Must be 18+ years old"
      ]),
      rewardPool: 10000,
      rewardToken: 'USDT',
      status: 'ACTIVE',
      createdById: admin.id,
      updatedAt: new Date(),
    },
  })

  const campaign2 = await prisma.campaign.upsert({
    where: { id: 'sample-campaign-2' },
    update: {},
    create: {
      id: 'sample-campaign-2',
      name: 'Product Launch Campaign',
      description: 'Generate buzz for our new product launch with creative content and social sharing. Create compelling content that showcases our latest innovations.',
      startDate: new Date('2024-07-01T00:00:00Z'),
      endDate: new Date('2024-09-30T23:59:59Z'),
      participantLimit: 50,
      eligibilityCriteria: JSON.stringify([
        "Previous campaign participation", 
        "Content creation experience", 
        "Portfolio of previous work"
      ]),
      rewardPool: 5000,
      rewardToken: 'NATIVE',
      status: 'ACTIVE',
      createdById: admin.id,
      updatedAt: new Date(),
    },
  })

  // Create sample tasks for campaigns
  const task1 = await prisma.task.create({
    data: {
      campaignId: campaign1.id,
      name: 'Share Instagram Story',
      description: 'Share our summer campaign content on your Instagram story with our hashtag #SummerVibes',
      category: 'SOCIAL_ENGAGEMENT',
      xpReward: 50,
      verificationMethod: 'MANUAL',
      requirements: JSON.stringify({
        platform: 'Instagram',
        action: 'story_share',
        hashtags: ['#SummerVibes']
      })
    }
  })

  const task2 = await prisma.task.create({
    data: {
      campaignId: campaign1.id,
      name: 'Create TikTok Video',
      description: 'Create an engaging TikTok video featuring our summer collection products',
      category: 'CONTENT_CREATION',
      xpReward: 100,
      verificationMethod: 'MANUAL',
      requirements: JSON.stringify({
        platform: 'TikTok',
        duration: '15-60 seconds',
        content: 'product showcase'
      })
    }
  })

  const task3 = await prisma.task.create({
    data: {
      campaignId: campaign2.id,
      name: 'Write Blog Post',
      description: 'Write a comprehensive blog post about our new product features and benefits',
      category: 'CONTENT_CREATION',
      xpReward: 200,
      verificationMethod: 'MANUAL',
      requirements: JSON.stringify({
        word_count: '500-1000 words',
        topics: ['product features', 'user benefits', 'use cases']
      })
    }
  })

  // Create NewTasks for daily tasks page
  const newTask1 = await prisma.newTask.create({
    data: {
      name: 'Follow us on Twitter',
      taskType: 'SOCIAL_MEDIA',
      description: 'Follow our official Twitter account and engage with our latest posts',
      instructions: 'Visit our Twitter profile and click the Follow button. Like and retweet our pinned post.',
      status: 'active',
      xp: 50,
      rewardOverride: true,
      rewardToken: 'USDT',
      rewardAmount: 2.5,
      frequency: 'one_time',
      perUserCap: 1,
      availableFrom: new Date(),
      availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      evidenceMode: 'manual',
      approvalWorkflow: 'manual',
      uniqueContent: true,
      requiredFields: {
        twitter_handle: 'string',
        screenshot_url: 'string'
      }
    }
  })

  const newTask2 = await prisma.newTask.create({
    data: {
      name: 'Join Our Discord Community', 
      taskType: 'COMMUNITY',
      description: 'Join our Discord server and introduce yourself in the #introductions channel',
      instructions: 'Click the Discord invite link, join the server, and post a brief introduction about yourself.',
      status: 'active',
      xp: 75,
      rewardOverride: true,
      rewardToken: 'USDT', 
      rewardAmount: 3.0,
      frequency: 'one_time',
      perUserCap: 1,
      availableFrom: new Date(),
      availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      evidenceMode: 'manual',
      approvalWorkflow: 'manual',
      uniqueContent: true,
      requiredFields: {
        discord_username: 'string',
        introduction_link: 'string'
      }
    }
  })

  const newTask3 = await prisma.newTask.create({
    data: {
      name: 'Share on Social Media',
      taskType: 'SOCIAL_MEDIA', 
      description: 'Create and share a post about TokenX on your social media platforms',
      instructions: 'Create an engaging post about TokenX features and share it on Twitter, LinkedIn, or Facebook. Include relevant hashtags.',
      status: 'active',
      xp: 100,
      rewardOverride: true,
      rewardToken: 'USDT',
      rewardAmount: 5.0,
      frequency: 'daily',
      perUserCap: 3,
      availableFrom: new Date(),
      availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      evidenceMode: 'manual', 
      approvalWorkflow: 'manual',
      uniqueContent: true,
      requiredFields: {
        post_url: 'string',
        platform: 'string',
        screenshot_url: 'string'
      }
    }
  })

  console.log('Seeded users:', { admin, ambassador })
  console.log('Seeded campaigns:', { campaign1, campaign2 })
  console.log('Seeded tasks:', { task1, task2, task3 })
  console.log('Seeded new tasks:', { newTask1, newTask2, newTask3 })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })