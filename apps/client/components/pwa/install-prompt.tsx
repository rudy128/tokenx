"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@repo/hooks"
import { Download, X, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay to avoid being intrusive
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000) // Show after 30 seconds
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      toast({
        title: "App Installed!",
        description: "TokenX has been installed successfully",
      })
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [toast])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        toast({
          title: "Installing...",
          description: "TokenX is being installed on your device",
        })
      }

      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error("Install prompt error:", error)
      toast({
        title: "Installation Error",
        description: "Failed to install the app. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("installPromptDismissed", "true")
  }

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  // Check if user already dismissed this session
  if (sessionStorage.getItem("installPromptDismissed")) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Install TokenX</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install our app for a better experience with offline access and push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
