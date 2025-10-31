"use client"

import { useState } from 'react'
import { UserProfile } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'

export function ClerkUserProfile() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        <UserProfile 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none",
              navbar: "hidden",
            },
          }}
        />
      </CardContent>
    </Card>
  )
}
