"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/NavBar"

export default function CampaignsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/campaigns")
  }, [router])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to campaigns...</p>
        </div>
      </div>
    </div>
  )
}