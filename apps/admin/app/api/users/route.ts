import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as { id: string; role?: UserRole }
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.AMBASSADOR, UserRole.ORGANIZATION] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        OrganizationMember: {
          include: {
            organization: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
