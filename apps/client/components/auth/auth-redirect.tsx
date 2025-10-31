"use client"

import { useEffect, useMemo, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, useUser } from "@clerk/nextjs"

// Minimal inline loading view to avoid extra dependencies
function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-sm text-muted-foreground">Checking your session…</p>
      </div>
    </div>
  )
}

export function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded } = useUser()
  const didNavigate = useRef(false)

  useEffect(() => {
    if (!authLoaded || !userLoaded) return
    if (didNavigate.current) return

    // Not signed-in -> to sign-in unless already there
    if (!isSignedIn) {
      if (pathname !== "/auth/signin") {
        console.log("[AuthRedirect] Not signed in. Navigating to /auth/signin from", pathname)
        didNavigate.current = true
        router.replace("/auth/signin")
      } else {
        console.log("[AuthRedirect] Already on /auth/signin. No-op.")
      }
      return
    }

    // Signed-in -> navigate to dashboard
    const dest = "/dashboard"
    if (pathname !== dest) {
      console.log("[AuthRedirect] isSignedIn; navigating to", dest, "from", pathname)
      didNavigate.current = true
      router.replace(dest)
    } else {
      console.log("[AuthRedirect] Already on target", dest, "No navigation.")
    }
  }, [authLoaded, userLoaded, isSignedIn, pathname, router])

  // Wait until Clerk is fully loaded before deciding
  if (!authLoaded || !userLoaded) return <LoadingView />

  // While navigation happens, keep a calm blank/loader to avoid flicker
  return <LoadingView />
}
