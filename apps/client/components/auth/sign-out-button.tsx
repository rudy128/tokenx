"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignOutButton({
  children = "Sign out",
  className,
  variant = "outline"
}: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({
      callbackUrl: "/auth/signin",
    })
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleSignOut}
    >
      {children}
    </Button>
  )
}