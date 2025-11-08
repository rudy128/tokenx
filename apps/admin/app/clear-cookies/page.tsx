"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClearCookiesPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Clearing cookies...")

  useEffect(() => {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    setStatus("Cookies cleared! Redirecting to sign-in...")
    
    setTimeout(() => {
      router.push("/sign-in")
    }, 1500)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {status}
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
             style={{ borderColor: 'var(--interactive-primary)' }}></div>
      </div>
    </div>
  )
}
