/**
 * Script to create an admin user
 * Run with: pnpm tsx scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || "admin@tokenx.com"
  const password = process.argv[3] || "admin123"
  const name = process.argv[4] || "Admin User"

  console.log("🔧 Creating admin user...")
  console.log(`📧 Email: ${email}`)
  console.log(`👤 Name: ${name}`)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log("⚠️  User already exists. Updating role to ADMIN...")
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        password: hashedPassword,
      },
    })
    
    console.log("✅ User updated successfully!")
  } else {
    // Create new admin user
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    })

    console.log("✅ Admin user created successfully!")
  }

  console.log("\n📝 Login credentials:")
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log("\n🔗 Admin panel: http://localhost:3001")
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
