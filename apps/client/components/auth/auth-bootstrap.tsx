"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

// This component doesn't render UI; it just ensures we wait for NextAuth to be ready
// and provides helpful diagnostics during development.
export function AuthBootstrap() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "loading") return

    console.log("[AuthBootstrap] ready:", {
      path: pathname,
      isSignedIn: !!session,
      userId: (session?.user as any)?.id,
      userEmail: session?.user?.email,
      status,
    })
  }, [session, status, pathname])

  return null
}
