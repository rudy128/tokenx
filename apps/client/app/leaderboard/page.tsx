"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LeaderboardPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to dashboard leaderboard page
    router.replace("/dashboard/leaderboard")
  }, [router])

  return null
}