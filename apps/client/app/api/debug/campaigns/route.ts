import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Debug endpoint to check campaigns and authentication
 * Access at: http://localhost:3000/api/debug/campaigns
 */
export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    }

    // 1. Check authentication
    try {
      const session = await auth()
      diagnostics.checks.authentication = {
        status: session ? 'SUCCESS' : 'FAILED',
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null
      }
    } catch (error: any) {
      diagnostics.checks.authentication = {
        status: 'ERROR',
        error: error.message
      }
    }

    // 2. Check database connection
    try {
      await prisma.$connect()
      diagnostics.checks.database = {
        status: 'SUCCESS',
        connected: true
      }
    } catch (error: any) {
      diagnostics.checks.database = {
        status: 'ERROR',
        connected: false,
        error: error.message
      }
    }

    // 3. Check campaigns in database
    try {
      const totalCampaigns = await prisma.campaign.count()
      const activeCampaigns = await prisma.campaign.count({
        where: { status: 'ACTIVE' }
      })
      const draftCampaigns = await prisma.campaign.count({
        where: { status: 'DRAFT' }
      })

      diagnostics.checks.campaigns = {
        status: 'SUCCESS',
        total: totalCampaigns,
        active: activeCampaigns,
        draft: draftCampaigns
      }

      // Get sample campaign
      const sampleCampaign = await prisma.campaign.findFirst({
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          endDate: true
        }
      })
      diagnostics.checks.campaigns.sample = sampleCampaign
    } catch (error: any) {
      diagnostics.checks.campaigns = {
        status: 'ERROR',
        error: error.message
      }
    }

    // 4. Check user in database (if authenticated)
    if (diagnostics.checks.authentication.userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: diagnostics.checks.authentication.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        })

        diagnostics.checks.user = {
          status: user ? 'SUCCESS' : 'NOT_FOUND',
          found: !!user,
          data: user
        }
      } catch (error: any) {
        diagnostics.checks.user = {
          status: 'ERROR',
          error: error.message
        }
      }
    }

    // 5. Check campaign participations (if authenticated)
    if (diagnostics.checks.authentication.userId) {
      try {
        const participations = await prisma.campaignParticipation.count({
          where: { userId: diagnostics.checks.authentication.userId }
        })

        diagnostics.checks.participations = {
          status: 'SUCCESS',
          count: participations
        }
      } catch (error: any) {
        diagnostics.checks.participations = {
          status: 'ERROR',
          error: error.message
        }
      }
    }

    // 6. Overall status
    const allChecks = Object.values(diagnostics.checks)
    const hasErrors = allChecks.some((check: any) => check.status === 'ERROR' || check.status === 'FAILED')
    
    diagnostics.overall = {
      status: hasErrors ? 'ISSUES_FOUND' : 'ALL_CHECKS_PASSED',
      summary: {
        authenticated: diagnostics.checks.authentication?.status === 'SUCCESS',
        databaseConnected: diagnostics.checks.database?.status === 'SUCCESS',
        campaignsFound: (diagnostics.checks.campaigns?.total || 0) > 0,
        userFound: diagnostics.checks.user?.status === 'SUCCESS'
      }
    }

    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic check failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
