"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SSOCallback() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect to signin for bypass mode
    router.replace('/auth/signin')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}