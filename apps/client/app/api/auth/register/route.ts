import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validateEmailInput, safePrismaUserFind, createErrorResponse } from "@/lib/env-debug"

export async function POST(request: Request) {
  try {
    console.log("🔍 Registration attempt starting...")
    const { email, password, name } = await request.json()
    
    console.log("🔍 Registration data received:", { 
      email: email ? `${email.slice(0, 5)}...` : 'missing',
      password: password ? 'provided' : 'missing',
      name: name ? 'provided' : 'missing'
    })

    if (!email || !password || !name) {
      console.log("❌ Registration failed: Missing required fields")
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Step 1: Validate email input
    const emailValidation = validateEmailInput(email)
    if (!emailValidation.isValid) {
      console.log("❌ Registration failed: Invalid email", emailValidation.error)
      return NextResponse.json(
        { message: `Invalid email: ${emailValidation.error}` },
        { status: 400 }
      )
    }

    // Step 2: Check if user already exists with enhanced error handling
    console.log("🔍 Checking for existing user...")
    const { user: existingUser, success, error } = await safePrismaUserFind(emailValidation.sanitized!)
    
    if (!success) {
      console.error("❌ Database query failed during registration:", error)
      return createErrorResponse("Database connection failed. Please try again later.", 500, { error })
    }

    if (existingUser) {
      console.log("❌ Registration failed: User already exists")
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      )
    }

    // Step 3: Hash password with error handling
    console.log("🔍 Hashing password...")
    let hashedPassword: string
    try {
      hashedPassword = await bcrypt.hash(password, 12)
    } catch (bcryptError) {
      console.error("❌ Password hashing failed:", bcryptError)
      return createErrorResponse("Password processing failed", 500)
    }

    // Step 4: Create user with comprehensive error handling
    console.log("🔍 Creating new user in database...")
    try {
      const user = await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: emailValidation.sanitized!,
          password: hashedPassword,
          name: name.trim(),
          role: "AMBASSADOR",
          tier: "BRONZE",
          xp: 0,
          tokenBalance: 0,
          usdtBalance: 0,
        },
      })

      console.log("✅ User created successfully:", user.id)
      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
        { status: 201 }
      )
    } catch (createError) {
      console.error("❌ User creation failed:", createError)
      
      // Handle specific Prisma errors
      if (createError instanceof Error) {
        if (createError.message.includes('Unique constraint')) {
          return NextResponse.json(
            { message: "User already exists" },
            { status: 400 }
          )
        }
      }
      
      return createErrorResponse("Failed to create user account", 500, { createError })
    }

  } catch (error) {
    console.error("❌ Registration error:", error)
    return createErrorResponse("Registration failed", 500, { error })
  }
}