import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuth } from "@/lib/auth-helpers"

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, dbUser) => {
    try {
      // Check if we have a valid database user
      if (!dbUser) {
        console.log("❌ Join Campaign: Database user not found for userId:", userId)
        return NextResponse.json({ 
          error: "User not found in database",
          message: "Your user account doesn't have a corresponding entry in the database.",
          details: "This typically happens when you're using a new account that hasn't been synced with the database.",
          solution: "Please contact support or try signing out and signing back in.",
          userId: userId
        }, { status: 404 });
      }

      console.log("✅ Join Campaign: Valid user found:", dbUser.email)

      const body = await request.json()
      const { campaignId } = body

      if (!campaignId) {
        console.log("❌ Join Campaign: Missing campaign ID")
        return NextResponse.json({ 
          error: "Campaign ID is required",
          message: "Please provide a valid campaign ID to join."
        }, { status: 400 })
      }

      console.log("🔍 Join Campaign: Attempting to join campaign:", campaignId)

      // Fetch campaign basic data
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      })

      if (!campaign) {
        console.log("❌ Join Campaign: Campaign not found:", campaignId)
        return NextResponse.json({ 
          error: "Campaign not found",
          message: "The requested campaign could not be found."
        }, { status: 404 })
      }

      if (campaign.status !== "ACTIVE") {
        console.log("❌ Join Campaign: Campaign not active:", campaign.status)
        return NextResponse.json({ 
          error: "Campaign is not active",
          message: `This campaign is currently ${campaign.status.toLowerCase()}. Only active campaigns accept new participants.`
        }, { status: 400 })
      }

      // Count approved participants separately (schema uses CampaignParticipation)
      let approvedCount = 0
      if (campaign.participantLimit) {
        approvedCount = await prisma.campaignParticipation.count({
          where: { campaignId: campaign.id, status: 'APPROVED' }
        })
        console.log(`🔍 Join Campaign: Current participants: ${approvedCount}/${campaign.participantLimit}`)
        
        if (approvedCount >= campaign.participantLimit) {
          console.log("❌ Join Campaign: Campaign is full")
          return NextResponse.json({ 
            error: "Campaign is full",
            message: `This campaign has reached its maximum capacity of ${campaign.participantLimit} participants.`
          }, { status: 400 })
        }
      }

      // Check if user already applied
      const existingParticipation = await prisma.campaignParticipation.findUnique({
        where: {
          userId_campaignId: {
            userId: dbUser.id,
            campaignId: campaignId
          }
        }
      })

      if (existingParticipation) {
        console.log("❌ Join Campaign: User already applied with status:", existingParticipation.status)
        const statusMessage = existingParticipation.status === 'PENDING' 
          ? "Your application is pending review."
          : existingParticipation.status === 'APPROVED'
          ? "You are already a participant in this campaign."
          : "Your previous application was rejected."
        
        return NextResponse.json({ 
          error: "You have already applied to this campaign",
          message: statusMessage,
          status: existingParticipation.status 
        }, { status: 400 })
      }

      // Create participation request - Auto-approve for now to simplify UX
      const participation = await prisma.campaignParticipation.create({
        data: {
          id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: dbUser.id,
          campaignId: campaignId,
          status: "APPROVED" // Changed from PENDING to APPROVED for immediate access
        }
      })

      console.log("✅ Join Campaign: Successfully joined campaign:", participation.id)

      return NextResponse.json({
        id: participation.id,
        status: participation.status,
        message: "Successfully joined the campaign! You can now view and complete tasks."
      }, { status: 201 })

    } catch (error) {
      console.error("❌ Join Campaign: Unexpected error:", error)
      return NextResponse.json({
        error: "Internal server error",
        message: "An unexpected error occurred while joining the campaign. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 })
    }
  });
}