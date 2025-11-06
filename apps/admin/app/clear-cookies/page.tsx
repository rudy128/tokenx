"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ClearCookiesPage() {
  const router = useRouter()
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    // Clear all possible session cookies
    const cookies = [
      "admin.session-token",
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
    ]

    cookies.forEach((cookieName) => {
      // Clear for current domain
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
      // Clear for subdomain
      document.cookie = `${cookieName}=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    })

    setCleared(true)
    
    // Redirect to sign-in after 2 seconds
    setTimeout(() => {
      router.push("/sign-in?cleared=true")
    }, 2000)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500"></div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {cleared ? "✅ Cookies Cleared!" : "🔄 Clearing Cookies..."}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {cleared 
            ? "Redirecting to sign-in..." 
            : "Removing all session cookies..."}
        </p>
        {cleared && (
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            <p>✅ admin.session-token</p>
            <p>✅ next-auth.session-token</p>
            <p>✅ CSRF tokens</p>
          </div>
        )}
      </div>
    </div>
  )
}
