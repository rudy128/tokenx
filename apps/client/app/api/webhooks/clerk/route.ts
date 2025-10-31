import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { prisma } from "@/lib/prisma"

// Mock WebhookEvent type since Clerk is not installed
interface WebhookEvent {
  type: string
  data: {
    id: string
    email_addresses?: Array<{ email_address: string }>
    image_url?: string
    first_name?: string
    last_name?: string
  }
}

export async function POST(req: Request) {
  // Get the headers from the request
  const svix_id = req.headers.get("svix-id")
  const svix_timestamp = req.headers.get("svix-timestamp")
  const svix_signature = req.headers.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return new Response("Error: Missing CLERK_WEBHOOK_SECRET", {
      status: 500,
    })
  }

  // Verify the webhook
  const wh = new Webhook(webhookSecret)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error verifying webhook", {
      status: 400,
    })
  }

  // Handle the event
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with ID: ${id} and type: ${eventType}`)

  try {
    if (eventType === "user.created" || eventType === "user.updated") {
      const anyData: any = evt.data as any;
      const clerkId = anyData.id as string;
      const email = anyData.email_addresses?.[0]?.email_address as string | undefined;
      const image_url = anyData.image_url as string | undefined;
      const first_name = anyData.first_name as string | undefined;
      const last_name = anyData.last_name as string | undefined;
      // Use hardcoded role enum instead of problematic import
      const normalizedRole = 'AMBASSADOR';
      const now = new Date();
      const { randomUUID } = await import('crypto');

      if (!clerkId) {
        return NextResponse.json({ error: 'No clerkId' }, { status: 400 });
      }

      await prisma.user.upsert({
        where: { clerkId },
        update: {
          email: email || undefined,
          name: `${first_name || ''} ${last_name || ''}`.trim() || undefined,
          image: image_url || undefined,
          role: normalizedRole,
          updatedAt: now,
        },
        create: {
          id: randomUUID(),
          clerkId,
          email: email || `user-${clerkId}@example.com`,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
          image: image_url || null,
          role: normalizedRole,
          createdAt: now,
          updatedAt: now,
          tier: 'BRONZE',
          xp: 0,
          tokenBalance: 0,
          usdtBalance: 0,
        },
      });
    }

    if (eventType === "user.deleted") {
      const { id: clerkId } = evt.data
      
      // Find user by clerkId
      const user = await prisma.user.findFirst({
        where: { clerkId: clerkId as string },
      })

      if (user) {
        // Option 1: Delete user (uncomment if you want to completely remove user data)
        // await prisma.user.delete({
        //   where: { id: user.id }
        // })
        
        // Option 2: Mark user as inactive (recommended to preserve data)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            // Add a field like 'active' in your schema if needed
            updatedAt: new Date()
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 })
  }

}
