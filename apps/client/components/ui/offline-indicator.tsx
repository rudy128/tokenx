"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Hide indicator after a brief delay when coming back online
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-2 px-3 py-1">
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Back Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            You're Offline
          </>
        )}
      </Badge>
    </div>
  )
}
