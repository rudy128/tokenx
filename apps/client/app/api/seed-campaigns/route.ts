import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Seeding comprehensive campaigns with tasks...')

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

    // Campaign 1: Social Media Mastery
    const campaign1 = await prisma.campaign.upsert({
      where: { id: 'social-media-mastery' },
      update: {},
      create: {
        id: 'social-media-mastery',
        name: 'Social Media Mastery Campaign',
        description: 'Master social media engagement and grow the TokenX community across all platforms',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        participantLimit: 200,
        eligibilityCriteria: 'Active social media accounts required',
        rewardPool: 10000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Campaign 2: Content Creator Hub
    const campaign2 = await prisma.campaign.upsert({
      where: { id: 'content-creator-hub' },
      update: {},
      create: {
        id: 'content-creator-hub',
        name: 'Content Creator Hub',
        description: 'Create engaging content about TokenX and blockchain technology',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        participantLimit: 100,
        eligibilityCriteria: 'Content creation experience preferred',
        rewardPool: 15000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Campaign 3: Community Growth Initiative
    const campaign3 = await prisma.campaign.upsert({
      where: { id: 'community-growth' },
      update: {},
      create: {
        id: 'community-growth',
        name: 'Community Growth Initiative',
        description: 'Help expand the TokenX community through referrals and engagement',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        participantLimit: 500,
        eligibilityCriteria: 'Must be active community member for 7+ days',
        rewardPool: 25000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Campaign 4: Developer Engagement
    const campaign4 = await prisma.campaign.upsert({
      where: { id: 'developer-engagement' },
      update: {},
      create: {
        id: 'developer-engagement',
        name: 'Developer Engagement Program',
        description: 'Engage with TokenX development community and contribute to ecosystem growth',
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        participantLimit: 75,
        eligibilityCriteria: 'Technical background or development experience required',
        rewardPool: 20000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Campaign 5: Ambassador Elite Program
    const campaign5 = await prisma.campaign.upsert({
      where: { id: 'ambassador-elite' },
      update: {},
      create: {
        id: 'ambassador-elite',
        name: 'Ambassador Elite Program',
        description: 'Exclusive program for top-performing ambassadors with premium rewards',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        participantLimit: 25,
        eligibilityCriteria: 'Must have completed 10+ tasks and earned 1000+ XP',
        rewardPool: 50000,
        rewardToken: 'USDT',
        status: 'ACTIVE',
        createdById: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Tasks for Campaign 1: Social Media Mastery
    const socialTasks = [
      {
        id: 'social-twitter-follow',
        name: 'Follow TokenX on Twitter',
        description: 'Follow @TokenX on Twitter to stay updated with the latest news and announcements',
        instructions: 'Visit https://twitter.com/TokenX and click the Follow button. Take a screenshot showing you followed the account.',
        actionUrl: 'https://twitter.com/TokenX',
        xp: 50,
        platform: 'Twitter',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'one_time',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'social-twitter-retweet',
        name: 'Retweet TokenX Latest Post',
        description: 'Retweet the latest TokenX announcement to help spread the word',
        instructions: 'Find the latest post from @TokenX and retweet it with your own comment. Screenshot the retweet.',
        actionUrl: 'https://twitter.com/TokenX',
        xp: 75,
        platform: 'Twitter',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'daily',
        evidenceMode: 'manual',
        approvalWorkflow: 'auto'
      },
      {
        id: 'social-discord-join',
        name: 'Join TokenX Discord Server',
        description: 'Join our Discord community and introduce yourself in the welcome channel',
        instructions: 'Join the TokenX Discord server and post an introduction message in #welcome channel.',
        actionUrl: 'https://discord.gg/tokenx',
        xp: 100,
        platform: 'Discord',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'one_time',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'social-linkedin-share',
        name: 'Share TokenX on LinkedIn',
        description: 'Share TokenX project on your LinkedIn profile to reach professional network',
        instructions: 'Create a LinkedIn post about TokenX, mentioning its benefits and potential. Include relevant hashtags.',
        actionUrl: 'https://linkedin.com',
        xp: 125,
        platform: 'LinkedIn',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      }
    ]

    // Tasks for Campaign 2: Content Creator Hub
    const contentTasks = [
      {
        id: 'content-blog-post',
        name: 'Write TokenX Blog Article',
        description: 'Create an informative blog post about TokenX features and benefits',
        instructions: 'Write a 500+ word blog post about TokenX. Cover key features, benefits, and your experience. Publish on Medium, personal blog, or LinkedIn.',
        actionUrl: 'https://medium.com',
        xp: 300,
        platform: 'Blog',
        taskType: 'CONTENT_CREATION',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'content-video-review',
        name: 'Create TokenX Video Review',
        description: 'Record a video review explaining TokenX features and your experience',
        instructions: 'Create a 3-5 minute video reviewing TokenX. Upload to YouTube, TikTok, or Instagram. Include key talking points and your honest opinion.',
        actionUrl: 'https://youtube.com',
        xp: 400,
        platform: 'Video',
        taskType: 'CONTENT_CREATION',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'content-infographic',
        name: 'Design TokenX Infographic',
        description: 'Create an engaging infographic showcasing TokenX statistics or features',
        instructions: 'Design an infographic using Canva, Figma, or similar tools. Focus on TokenX key metrics, features, or benefits. Share on social media.',
        actionUrl: 'https://canva.com',
        xp: 250,
        platform: 'Design',
        taskType: 'CONTENT_CREATION',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'content-thread-twitter',
        name: 'Create TokenX Twitter Thread',
        description: 'Write an educational Twitter thread about TokenX or blockchain technology',
        instructions: 'Create a 5-10 tweet thread explaining TokenX features, benefits, or blockchain concepts. Use engaging visuals and relevant hashtags.',
        actionUrl: 'https://twitter.com',
        xp: 200,
        platform: 'Twitter',
        taskType: 'CONTENT_CREATION',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'auto'
      }
    ]

    // Tasks for Campaign 3: Community Growth
    const communityTasks = [
      {
        id: 'community-referral',
        name: 'Refer New Community Members',
        description: 'Invite friends and colleagues to join the TokenX community',
        instructions: 'Share your referral link with friends. When they join and complete their first task, you both earn bonus XP.',
        actionUrl: 'https://tokenx.com/referral',
        xp: 150,
        platform: 'Referral',
        taskType: 'REFERRAL',
        frequency: 'unlimited',
        evidenceMode: 'auto',
        approvalWorkflow: 'auto'
      },
      {
        id: 'community-telegram-active',
        name: 'Be Active in Telegram Group',
        description: 'Participate actively in TokenX Telegram discussions',
        instructions: 'Join TokenX Telegram group and participate in discussions. Answer questions, share insights, and help new members.',
        actionUrl: 'https://t.me/tokenx',
        xp: 100,
        platform: 'Telegram',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'daily',
        evidenceMode: 'manual',
        approvalWorkflow: 'auto'
      },
      {
        id: 'community-reddit-engagement',
        name: 'Engage on TokenX Subreddit',
        description: 'Participate in discussions on the TokenX subreddit',
        instructions: 'Join r/TokenX subreddit, upvote quality posts, comment thoughtfully, and share relevant content.',
        actionUrl: 'https://reddit.com/r/tokenx',
        xp: 75,
        platform: 'Reddit',
        taskType: 'SOCIAL_MEDIA',
        frequency: 'daily',
        evidenceMode: 'manual',
        approvalWorkflow: 'auto'
      },
      {
        id: 'community-feedback',
        name: 'Provide Product Feedback',
        description: 'Share constructive feedback about TokenX features and improvements',
        instructions: 'Use the TokenX platform and provide detailed feedback about your experience. Suggest improvements or report issues.',
        actionUrl: 'https://tokenx.com/feedback',
        xp: 200,
        platform: 'Feedback',
        taskType: 'FEEDBACK',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      }
    ]

    // Tasks for Campaign 4: Developer Engagement
    const devTasks = [
      {
        id: 'dev-github-star',
        name: 'Star TokenX GitHub Repository',
        description: 'Star the TokenX GitHub repository to show your support',
        instructions: 'Visit the TokenX GitHub repository and click the Star button. Screenshot the starred repository.',
        actionUrl: 'https://github.com/tokenx/tokenx',
        xp: 50,
        platform: 'GitHub',
        taskType: 'TECHNICAL',
        frequency: 'one_time',
        evidenceMode: 'manual',
        approvalWorkflow: 'auto'
      },
      {
        id: 'dev-code-review',
        name: 'Review TokenX Code',
        description: 'Review TokenX smart contracts or frontend code and provide feedback',
        instructions: 'Examine TokenX codebase, identify potential improvements, and submit detailed feedback or pull requests.',
        actionUrl: 'https://github.com/tokenx/tokenx',
        xp: 500,
        platform: 'GitHub',
        taskType: 'TECHNICAL',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'dev-integration-guide',
        name: 'Write Integration Guide',
        description: 'Create a technical guide for integrating with TokenX APIs',
        instructions: 'Write a comprehensive guide explaining how to integrate with TokenX APIs. Include code examples and best practices.',
        actionUrl: 'https://docs.tokenx.com',
        xp: 750,
        platform: 'Documentation',
        taskType: 'TECHNICAL',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'dev-bug-report',
        name: 'Report Technical Issues',
        description: 'Test TokenX platform and report any bugs or technical issues',
        instructions: 'Thoroughly test TokenX features and report any bugs with detailed reproduction steps and screenshots.',
        actionUrl: 'https://github.com/tokenx/tokenx/issues',
        xp: 300,
        platform: 'GitHub',
        taskType: 'TECHNICAL',
        frequency: 'unlimited',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      }
    ]

    // Tasks for Campaign 5: Ambassador Elite
    const eliteTasks = [
      {
        id: 'elite-ama-host',
        name: 'Host TokenX AMA Session',
        description: 'Organize and host an Ask Me Anything session about TokenX',
        instructions: 'Schedule and host an AMA session on Twitter Spaces, Discord, or Telegram. Invite community members and answer questions about TokenX.',
        actionUrl: 'https://twitter.com/i/spaces',
        xp: 1000,
        platform: 'AMA',
        taskType: 'COMMUNITY_MANAGEMENT',
        frequency: 'monthly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'elite-partnership-proposal',
        name: 'Propose Strategic Partnership',
        description: 'Identify and propose potential partnerships for TokenX',
        instructions: 'Research and propose strategic partnerships that could benefit TokenX. Include detailed analysis and contact information.',
        actionUrl: 'https://tokenx.com/partnerships',
        xp: 1500,
        platform: 'Business',
        taskType: 'BUSINESS_DEVELOPMENT',
        frequency: 'monthly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'elite-mentor-newbies',
        name: 'Mentor New Ambassadors',
        description: 'Guide and mentor new community members and ambassadors',
        instructions: 'Help onboard new ambassadors, answer their questions, and guide them through their first tasks. Document your mentoring activities.',
        actionUrl: 'https://discord.gg/tokenx',
        xp: 800,
        platform: 'Mentoring',
        taskType: 'COMMUNITY_MANAGEMENT',
        frequency: 'weekly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      },
      {
        id: 'elite-event-organize',
        name: 'Organize Community Event',
        description: 'Plan and execute a community event or meetup',
        instructions: 'Organize a virtual or physical event for the TokenX community. This could be a meetup, workshop, or networking event.',
        actionUrl: 'https://eventbrite.com',
        xp: 2000,
        platform: 'Events',
        taskType: 'EVENT_MANAGEMENT',
        frequency: 'monthly',
        evidenceMode: 'manual',
        approvalWorkflow: 'manual'
      }
    ]

    // Create all tasks
    const allTasks = [
      ...socialTasks.map(task => ({ ...task, campaignId: campaign1.id })),
      ...contentTasks.map(task => ({ ...task, campaignId: campaign2.id })),
      ...communityTasks.map(task => ({ ...task, campaignId: campaign3.id })),
      ...devTasks.map(task => ({ ...task, campaignId: campaign4.id })),
      ...eliteTasks.map(task => ({ ...task, campaignId: campaign5.id }))
    ]

    // Insert tasks into database
    for (const taskData of allTasks) {
      await prisma.task.upsert({
        where: { id: taskData.id },
        update: {},
        create: {
          id: taskData.id,
          name: taskData.name,
          description: taskData.description,
          category: taskData.taskType === 'SOCIAL_MEDIA' ? 'SOCIAL_ENGAGEMENT' : 
                   taskData.taskType === 'CONTENT_CREATION' ? 'CONTENT_CREATION' :
                   taskData.taskType === 'REFERRAL' ? 'REFERRAL' :
                   taskData.taskType === 'TECHNICAL' ? 'CUSTOM' :
                   taskData.taskType === 'FEEDBACK' ? 'COMMUNITY_BUILDING' :
                   taskData.taskType === 'BUSINESS_DEVELOPMENT' ? 'CUSTOM' :
                   taskData.taskType === 'COMMUNITY_MANAGEMENT' ? 'COMMUNITY_BUILDING' :
                   taskData.taskType === 'EVENT_MANAGEMENT' ? 'CUSTOM' : 'CUSTOM',
          xpReward: taskData.xp,
          verificationMethod: taskData.approvalWorkflow === 'auto' ? 'AI_AUTO' : 'MANUAL',
          requirements: [taskData.instructions],
          status: 'active',
          campaignId: taskData.campaignId
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Comprehensive campaigns and tasks seeded successfully!',
      data: {
        campaigns: [
          { id: campaign1.id, name: campaign1.name, tasks: socialTasks.length },
          { id: campaign2.id, name: campaign2.name, tasks: contentTasks.length },
          { id: campaign3.id, name: campaign3.name, tasks: communityTasks.length },
          { id: campaign4.id, name: campaign4.name, tasks: devTasks.length },
          { id: campaign5.id, name: campaign5.name, tasks: eliteTasks.length }
        ],
        totalTasks: allTasks.length,
        totalRewardPool: 120000
      }
    })

  } catch (error) {
    console.error('❌ Error seeding campaigns:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed campaigns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to seed campaigns",
    info: "This endpoint creates comprehensive campaigns with detailed tasks"
  })
}