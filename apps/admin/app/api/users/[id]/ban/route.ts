import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// UserRole enum - temporary definition until Prisma generation is fixed
enum UserRole {
  ADMIN = "ADMIN",
  AMBASSADOR = "AMBASSADOR",
  ORGANIZATION = "ORGANIZATION",
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const actor = session.user as { id: string; role?: string }
    if (actor.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const ban = body?.ban ?? true
    const reason = typeof body?.reason === "string" ? body.reason : undefined

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (![UserRole.AMBASSADOR, UserRole.ORGANIZATION].includes(target.role as UserRole)) {
      return NextResponse.json({ error: "Only Ambassadors and Organizations can be managed" }, { status: 400 })
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      // Update user ban status
      await (tx as any).user.update({
        where: { id },
        data: {
          isBanned: ban,
          bannedAt: ban ? now : null,
          bannedBy: ban ? actor.id : null,
          bannedReason: ban ? reason : null,
        },
      })

      // If org user, also update their organization
      if (target.role as string === "ORGANIZATION") {
        const memberships = await (tx as any).organizationMember.findMany({
          where: { userId: id },
          select: { organizationId: true },
        })
        const organizationIds = memberships.map((m: any) => m.organizationId)

        if (organizationIds.length > 0) {
          // Update organization status
          await (tx as any).organization.updateMany({
            where: { id: { in: organizationIds } },
            data: {
              isBanned: ban,
              bannedAt: ban ? now : null,
              bannedBy: ban ? actor.id : null,
              bannedReason: ban ? reason : null,
            },
          })

          // Archive/activate campaigns
          await (tx as any).campaign.updateMany({
            where: { organizationId: { in: organizationIds } },
            data: {
              status: ban ? "CANCELLED" : "ACTIVE",
            },
          })

          // Archive/activate tasks
          await (tx as any).task.updateMany({
            where: { organizationId: { in: organizationIds } },
            data: {
              status: ban ? "archived" : "active",
              isActive: !ban,
            },
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      userId: id,
      isBanned: ban,
    })
  } catch (error) {
    console.error("Error banning user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
