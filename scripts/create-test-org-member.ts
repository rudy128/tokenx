import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTestOrganizationMember() {
  try {
    // First, check if we need to create a test user and organization
    let testUser = await prisma.user.findUnique({
      where: { email: "orgmember@test.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: "test_org_user_001",
          email: "orgmember@test.com",
          name: "Test Organization Member",
          role: "AMBASSADOR",
        },
      });
      console.log("✅ Created test user:", testUser.email);
    } else {
      console.log("ℹ️  Test user already exists:", testUser.email);
    }

    // Check if organization exists
    let testOrg = await prisma.organization.findFirst({
      where: { name: "Test Organization" },
    });

    if (!testOrg) {
      testOrg = await prisma.organization.create({
        data: {
          name: "Test Organization",
          description: "A test organization for development",
          status: "ACTIVE",
        },
      });
      console.log("✅ Created test organization:", testOrg.name);
    } else {
      console.log("ℹ️  Test organization already exists:", testOrg.name);
    }

    // Check if organization member already exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: testUser.id,
          organizationId: testOrg.id,
        },
      },
    });

    if (existingMember) {
      console.log("ℹ️  Organization member already exists");
      console.log("   Updating password...");
      
      const passwordHash = await bcrypt.hash("test123", 10);
      
      await prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId: testUser.id,
            organizationId: testOrg.id,
          },
        },
        data: {
          passwordHash,
        },
      });
      
      console.log("✅ Updated organization member password");
    } else {
      // Create organization member with password
      const passwordHash = await bcrypt.hash("test123", 10);

      const orgMember = await prisma.organizationMember.create({
        data: {
          userId: testUser.id,
          organizationId: testOrg.id,
          role: "admin",
          passwordHash,
        },
      });

      console.log("✅ Created organization member");
      console.log("   Member ID:", orgMember.id);
      console.log("   Role:", orgMember.role);
    }

    console.log("\n🎉 Test organization member setup complete!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: orgmember@test.com");
    console.log("   Password: test123");
    console.log("   URL: http://localhost:3002/sign-in");

  } catch (error) {
    console.error("❌ Error creating test organization member:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestOrganizationMember();
