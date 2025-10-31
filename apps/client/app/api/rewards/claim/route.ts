import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { withAuth } from "@/lib/auth-helpers"

interface ClaimRequest {
  amount: number
  token: string
  walletAddress: string
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (clerkId, dbUserId) => {
    try {
      // Check if we have a valid database user
      if (!dbUserId) {
        return NextResponse.json({ 
          error: "User not found in database",
          clerkId: clerkId
        }, { status: 404 });
      }

      const body: ClaimRequest = await request.json()
    const { amount, token, walletAddress } = body

    // Validate user balance
    const userBalance = await getUserBalance(dbUserId, token)
    if (userBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    // Validate wallet address format
    if (!isValidWalletAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    // Process withdrawal
    const claimResult = await processWithdrawal(dbUserId, amount, token, walletAddress)

    if (claimResult.success) {
      // Update user balance
      await updateUserBalance(dbUserId, -amount, token)

      // Create transaction record
      await createTransactionRecord({
        userId: dbUserId,
        type: "WITHDRAWAL",
        amount: amount,
        token: token,
        walletAddress: walletAddress,
        txHash: claimResult.txHash,
        status: "COMPLETED",
      })

      return NextResponse.json({
        success: true,
        txHash: claimResult.txHash,
        message: "Withdrawal processed successfully",
      })
    } else {
      return NextResponse.json({ error: claimResult.error }, { status: 500 })
    }
    } catch (error) {
      console.error("Error claiming rewards:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  })
}

async function getUserBalance(userId: string, token: string): Promise<number> {
  // Mock balance check - replace with actual database query
  const mockBalances: Record<string, number> = {
    USDT: 125.5,
    NATIVE: 2500,
  }
  return mockBalances[token] || 0
}

function isValidWalletAddress(address: string): boolean {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

async function processWithdrawal(
  userId: string,
  amount: number,
  token: string,
  walletAddress: string,
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    // Mock blockchain withdrawal - replace with actual implementation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate transaction success (90% success rate)
    const success = Math.random() > 0.1

    if (success) {
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)
      return { success: true, txHash: mockTxHash }
    } else {
      return { success: false, error: "Blockchain transaction failed" }
    }
  } catch (error) {
    return { success: false, error: "Network error" }
  }
}

async function updateUserBalance(userId: string, amount: number, token: string) {
  // Mock balance update - replace with actual database operation
  console.log(`Updating balance for user ${userId}: ${amount > 0 ? "+" : ""}${amount} ${token}`)
}

async function createTransactionRecord(transaction: {
  userId: string
  type: string
  amount: number
  token: string
  walletAddress: string
  txHash?: string
  status: string
}) {
  // Mock transaction record creation - replace with actual database operation
  console.log("Creating transaction record:", transaction)
}
