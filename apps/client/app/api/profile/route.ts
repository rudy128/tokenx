import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('Profile GET - Session:', session)
    
    if (!session?.user?.email) {
      console.log('Profile GET - No session or email')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Profile GET - Fetching user:', session.user.email)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        twitterUsername: true,
        xp: true,
        tier: true,
        walletAddress: true,
      },
    })

    console.log('Profile GET - User found:', user)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('Profile PATCH - Session:', session)
    
    if (!session?.user?.email) {
      console.log('Profile PATCH - No session or email')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Profile PATCH - Body:', body)
    
    const { twitterUsername } = body

    // Validate and clean username
    if (twitterUsername !== undefined) {
      const cleanUsername = twitterUsername.replace('@', '').trim()
      
      console.log('Profile PATCH - Clean username:', cleanUsername)
      
      if (cleanUsername && !/^[a-zA-Z0-9_]{1,15}$/.test(cleanUsername)) {
        console.log('Profile PATCH - Invalid format')
        return NextResponse.json(
          { error: 'Invalid Twitter username format' },
          { status: 400 }
        )
      }

      console.log('Profile PATCH - Updating user:', session.user.email)

      const user = await prisma.user.update({
        where: { email: session.user.email },
        data: { twitterUsername: cleanUsername || null },
        select: {
          id: true,
          email: true,
          name: true,
          twitterUsername: true,
        },
      })

      console.log('Profile PATCH - Updated user:', user)

      return NextResponse.json(user)
    }

    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
