import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Gift, Clock, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/NavBar"

export default function RewardsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Gift className="h-16 w-16 text-primary" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Coming Soon</span>
            </div>
            <p className="text-muted-foreground">
              We're developing a comprehensive rewards system where you can earn and claim tokens for your ambassador activities.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">What's Coming</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Token rewards for completed tasks</li>
              <li>• NFT achievements and badges</li>
              <li>• Staking and bonus multipliers</li>
              <li>• Wallet integration for claims</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/tasks/daily">
              <Button variant="outline" className="w-full">
                Complete Tasks
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}