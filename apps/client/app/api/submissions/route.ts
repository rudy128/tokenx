import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  return withAuth(request, async (clerkId, dbUserId) => {
    try {
      if (!dbUserId) {
        return NextResponse.json({
          error: "User not found in database",
          clerkId: clerkId,
        }, { status: 404 });
      }

      const { searchParams } = new URL(request.url)
      const status = searchParams.get("status")

      // Mock data - replace with actual Prisma queries
      const submissions = [
        {
          id: "1",
          userId: "user1",
          taskId: "1",
          campaignId: "1",
          proofUrl: "https://twitter.com/user/status/123456789",
          proofImage: "/placeholder.svg?height=200&width=300",
          description: "Completed the like task as requested",
          status: "PENDING",
          submittedAt: "2024-01-15T10:30:00Z",
          user: {
            name: "Alice Johnson",
            email: "alice@example.com",
            image: "/placeholder.svg?height=32&width=32",
          },
          task: {
            name: "Like Posts",
            xpReward: 10,
            campaign: {
              name: "Summer Social Media Campaign",
            },
          },
        },
        {
          id: "2",
          userId: "user2",
          taskId: "2",
          campaignId: "1",
          proofUrl: "https://twitter.com/user2/status/987654321",
          description: "Retweeted with campaign hashtag #SummerVibes",
          status: "PENDING",
          submittedAt: "2024-01-14T15:45:00Z",
          user: {
            name: "Bob Smith",
            email: "bob@example.com",
          },
          task: {
            name: "Retweet Campaign",
            xpReward: 25,
            campaign: {
              name: "Summer Social Media Campaign",
            },
          },
        },
      ]

      const filteredSubmissions = status ? submissions.filter((sub) => sub.status === status) : submissions

      return NextResponse.json(filteredSubmissions)
    } catch (error) {
      console.error("Error fetching submissions:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
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
    const { taskId, campaignId, proofUrl, proofImage, description } = body

    // Mock response - replace with actual Prisma create
    const submission = {
      id: Date.now().toString(),
      userId: dbUserId,
      taskId,
      campaignId,
      proofUrl,
      proofImage,
      description,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    }

    return NextResponse.json(submission, { status: 201 })
  });
}
