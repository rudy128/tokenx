import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Return mock user data
    const mockUser = {
      id: 'demo-user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      image: null,
      role: 'AMBASSADOR',
      tier: 'BRONZE',
      xp: 1250,
      tokenBalance: 150,
      usdtBalance: 0,
      walletAddress: null,
    }

    return NextResponse.json({ user: mockUser })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { name, walletAddress } = await request.json()

    // Return updated mock data
    const updatedUser = {
      id: 'demo-user-1',
      name: name || 'Demo User',
      email: 'demo@example.com',
      image: null,
      role: 'AMBASSADOR',
      tier: 'BRONZE',
      xp: 1250,
      tokenBalance: 150,
      usdtBalance: 0,
      walletAddress: walletAddress ? walletAddress.toLowerCase() : null,
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
