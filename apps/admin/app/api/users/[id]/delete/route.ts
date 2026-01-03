import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// UserRole enum - temporary definition until Prisma generation is fixed
enum UserRole {
  ADMIN = "ADMIN",
  AMBASSADOR = "AMBASSADOR",
  ORGANIZATION = "ORGANIZATION",
}

export async function DELETE(
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

    const target = await prisma.user.findUnique({ where: { id } })
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (![UserRole.AMBASSADOR, UserRole.ORGANIZATION].includes(target.role as UserRole)) {
      return NextResponse.json({ error: "Only Ambassadors and Organizations can be deleted" }, { status: 400 })
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      // If org user, archive their organization and assets
      if (target.role as string === "ORGANIZATION") {
        const memberships = await (tx as any).organizationMember.findMany({
          where: { userId: id },
          select: { organizationId: true },
        })
        const organizationIds = memberships.map((m: any) => m.organizationId)

        if (organizationIds.length > 0) {
          // Mark organization as deleted
          await (tx as any).organization.updateMany({
            where: { id: { in: organizationIds } },
            data: {
              isDeleted: true,
              deletedAt: now,
              deletedBy: actor.id,
            },
          })

          // Cancel all campaigns
          await (tx as any).campaign.updateMany({
            where: { organizationId: { in: organizationIds } },
            data: {
              status: "CANCELLED",
            },
          })

          // Archive all tasks
          await (tx as any).task.updateMany({
            where: { organizationId: { in: organizationIds } },
            data: {
              status: "archived",
              isActive: false,
            },
          })
        }
      }

      // Delete the user
      await (tx as any).user.delete({ where: { id } })
    })

    return NextResponse.json({
      success: true,
      message: `User ${id} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
