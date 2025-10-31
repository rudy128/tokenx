import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withAuth } from "@/lib/auth-helpers"

interface TwitterMetrics {
  likes: number
  retweets: number
  replies: number
  views: number
  engagement_rate: number
}

interface VerificationResult {
  success: boolean
  confidence: number
  metrics?: TwitterMetrics
  reason?: string
  evidence?: string[]
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (clerkId, dbUserId) => {
    if (!dbUserId) {
      return NextResponse.json({ 
        error: "User not found in database",
        clerkId: clerkId
      }, { status: 404 });
    }

    const body = await request.json()
    const { submissionId, taskType, proofUrl, requirements } = body

    // Mock AI verification logic - replace with actual AI service
    const verificationResult = await performAIVerification(taskType, proofUrl, requirements)

    // Update submission status based on verification result
    const updatedSubmission = {
      id: submissionId,
      status: verificationResult.success ? "APPROVED" : "REJECTED",
      aiVerification: {
        confidence: verificationResult.confidence,
        metrics: verificationResult.metrics,
        reason: verificationResult.reason,
        evidence: verificationResult.evidence,
        verifiedAt: new Date().toISOString(),
      },
    }

    // If approved, award XP and update user progress
    if (verificationResult.success) {
      await awardXPAndUpdateProgress(dbUserId, submissionId)
    }

    return NextResponse.json({
      success: true,
      result: verificationResult,
      submission: updatedSubmission,
    })
  });
}

async function performAIVerification(
  taskType: string,
  proofUrl: string,
  requirements: string,
): Promise<VerificationResult> {
  // Mock AI verification logic based on task type
  switch (taskType) {
    case "LIKE_POSTS":
      return await verifyLikeTask(proofUrl)
    case "RETWEET":
      return await verifyRetweetTask(proofUrl)
    case "CREATE_TWEET":
      return await verifyTweetCreation(proofUrl, requirements)
    case "FOLLOW_ACCOUNT":
      return await verifyFollowTask(proofUrl)
    default:
      return {
        success: false,
        confidence: 0,
        reason: "Unsupported task type for AI verification",
      }
  }
}

async function verifyLikeTask(proofUrl: string): Promise<VerificationResult> {
  // Mock Twitter API integration - replace with actual Twitter API calls
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock verification logic
    const isValidTwitterUrl = proofUrl.includes("twitter.com") || proofUrl.includes("x.com")
    const hasValidTweetId = /status\/\d+/.test(proofUrl)

    if (!isValidTwitterUrl || !hasValidTweetId) {
      return {
        success: false,
        confidence: 0.95,
        reason: "Invalid Twitter URL format",
      }
    }

    // Mock metrics from Twitter API
    const mockMetrics: TwitterMetrics = {
      likes: Math.floor(Math.random() * 100) + 10,
      retweets: Math.floor(Math.random() * 50) + 5,
      replies: Math.floor(Math.random() * 20) + 2,
      views: Math.floor(Math.random() * 1000) + 100,
      engagement_rate: Math.random() * 0.1 + 0.02,
    }

    // Simulate verification success based on engagement
    const success = mockMetrics.likes > 5 && mockMetrics.engagement_rate > 0.01

    return {
      success,
      confidence: success ? 0.92 : 0.88,
      metrics: mockMetrics,
      reason: success ? "Tweet shows sufficient engagement" : "Low engagement detected",
      evidence: [`Likes: ${mockMetrics.likes}`, `Engagement rate: ${(mockMetrics.engagement_rate * 100).toFixed(2)}%`],
    }
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      reason: "Failed to verify Twitter engagement",
    }
  }
}

async function verifyRetweetTask(proofUrl: string): Promise<VerificationResult> {
  // Mock retweet verification
  await new Promise((resolve) => setTimeout(resolve, 800))

  const isValidUrl = proofUrl.includes("twitter.com") || proofUrl.includes("x.com")
  const success = isValidUrl && Math.random() > 0.1 // 90% success rate for demo

  return {
    success,
    confidence: 0.94,
    reason: success ? "Retweet verified successfully" : "Retweet not found or invalid URL",
    evidence: success ? ["Retweet confirmed", "Original tweet engagement tracked"] : ["URL validation failed"],
  }
}

async function verifyTweetCreation(proofUrl: string, requirements: string): Promise<VerificationResult> {
  // Mock tweet content verification
  await new Promise((resolve) => setTimeout(resolve, 1200))

  const isValidUrl = proofUrl.includes("twitter.com") || proofUrl.includes("x.com")
  const hasHashtag = (requirements?.toLowerCase() || "").includes("hashtag")
  const success = isValidUrl && Math.random() > 0.15 // 85% success rate

  const mockMetrics: TwitterMetrics = {
    likes: Math.floor(Math.random() * 50) + 5,
    retweets: Math.floor(Math.random() * 25) + 2,
    replies: Math.floor(Math.random() * 15) + 1,
    views: Math.floor(Math.random() * 500) + 50,
    engagement_rate: Math.random() * 0.08 + 0.01,
  }

  return {
    success,
    confidence: 0.89,
    metrics: mockMetrics,
    reason: success ? "Tweet content meets requirements" : "Content requirements not met",
    evidence: success
      ? ["Required hashtags found", "Content quality verified", "Engagement tracking active"]
      : ["Missing required elements", "Content quality below threshold"],
  }
}

async function verifyFollowTask(proofUrl: string): Promise<VerificationResult> {
  // Mock follow verification
  await new Promise((resolve) => setTimeout(resolve, 600))

  const success = Math.random() > 0.05 // 95% success rate for follows

  return {
    success,
    confidence: 0.98,
    reason: success ? "Follow action verified" : "Follow not detected",
    evidence: success ? ["Follow relationship confirmed", "Account activity verified"] : ["Follow verification failed"],
  }
}

async function awardXPAndUpdateProgress(userId: string, submissionId: string) {
  // Mock XP awarding and progress update - replace with actual database operations
  console.log(`Awarding XP to user ${userId} for submission ${submissionId}`)

  // This would typically:
  // 1. Update user's total XP
  // 2. Check for tier progression
  // 3. Update campaign progress
  // 4. Trigger achievement checks
  // 5. Calculate reward distribution
}
