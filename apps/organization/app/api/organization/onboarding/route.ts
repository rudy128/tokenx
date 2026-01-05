import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, organizationName, description, website } = body;

    console.log("🟢 Onboarding API called with:", { email, organizationName, description, website });

    // Validate input
    if (!email || !organizationName) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { error: "Email and organization name are required" },
        { status: 400 }
      );
    }

    // Find the user
    console.log("🟢 Finding user:", email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        OrganizationMember: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      console.error("❌ User not found:", email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("🟢 User found:", user.id);

    // Find the organization member (should be the only one, created during signup)
    const orgMember = user.OrganizationMember[0];
    
    if (!orgMember) {
      console.error("❌ Organization member not found for user:", user.id);
      return NextResponse.json(
        { error: "Organization member not found" },
        { status: 404 }
      );
    }

    console.log("🟢 Organization member found:", orgMember.id, "Org ID:", orgMember.organizationId);
    console.log("🟢 Current org status:", orgMember.organization.status);

    // Update the organization with the provided details
    console.log("🟢 Updating organization to ACTIVE...");
    const updatedOrganization = await prisma.organization.update({
      where: {
        id: orgMember.organizationId,
      },
      data: {
        name: organizationName,
        description: description || null,
        website: website || null,
        status: "ACTIVE", // Activate the organization
      },
    });

    console.log("✅ Organization updated successfully:", {
      id: updatedOrganization.id,
      name: updatedOrganization.name,
      status: updatedOrganization.status,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Organization setup completed successfully",
        organization: {
          id: updatedOrganization.id,
          name: updatedOrganization.name,
          status: updatedOrganization.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Onboarding error:", error);
    return NextResponse.json(
      { error: "An error occurred during onboarding" },
      { status: 500 }
    );
  }
}
