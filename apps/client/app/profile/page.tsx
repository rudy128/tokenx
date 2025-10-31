"use client"

import { useState, useEffect } from "react"
// No authentication needed
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { metaMask } from "wagmi/connectors"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, Chrome, User, Mail, Shield, Star } from "lucide-react"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState("Demo User")
  const [walletAddress, setWalletAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const mockUser = {
    name: "Demo User",
    email: "demo@example.com"
  }

  useEffect(() => {
    if (address) {
      setWalletAddress(address)
    }
  }, [address])

  const handleUpdateProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          walletAddress: isConnected ? address : walletAddress,
        }),
      })

      if (response.ok) {
        // Refresh user data if needed
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectWallet = () => {
    connect({ connector: metaMask() })
  }

  const handleDisconnectWallet = () => {
    disconnect()
    setWalletAddress("")
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
      case "SILVER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "GOLD":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "PLATINUM":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Always allow access to profile

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account and connected services</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" value={mockUser.email} disabled className="pl-10" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline">Ambassador</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Tier:</span>
                <Badge className={getTierColor("BRONZE")}>Bronze</Badge>
              </div>
            </div>
            <Button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected social accounts and wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Accounts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Chrome className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Simple Auth</p>
                    <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>

            <Separator />

            {/* Wallet Connection */}
            <div className="space-y-3">
              <h4 className="font-medium">Wallet Connection</h4>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5" />
                  <div>
                    <p className="font-medium">MetaMask</p>
                    <p className="text-sm text-muted-foreground">
                      {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
                    Disconnect
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleConnectWallet}>
                    Connect
                  </Button>
                )}
              </div>

              {!isConnected && (
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Manual Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
