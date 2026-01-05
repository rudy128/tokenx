import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if they're already an organization member
      const existingMember = await prisma.organizationMember.findFirst({
        where: { userId: existingUser.id },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Create user if doesn't exist
    let user = existingUser;
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `org_user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          email,
          name,
          role: "ORGANIZATION", // Set role as ORGANIZATION
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create a placeholder organization (will be updated in onboarding)
    const organization = await prisma.organization.create({
      data: {
        name: `${name}'s Organization`, // Temporary name
        status: "INACTIVE", // Set as INACTIVE until onboarding is complete
      },
    });

    // Create organization member
    const orgMember = await prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "owner", // First member is the owner
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId: user.id,
        organizationId: organization.id,
        memberId: orgMember.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}
