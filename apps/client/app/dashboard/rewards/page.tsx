import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Gift, Clock, Star, Sparkles } from "lucide-react"
import Link from "next/link"

export default function RewardsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} className="flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Gift className="h-16 w-16 text-[var(--accent-primary)]" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[var(--text-primary)]">Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-[var(--accent-primary)]">
              <Clock className="h-5 w-5" />
              <span className="font-semibold text-[var(--text-primary)]">Coming Soon</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              We're developing a comprehensive rewards system where you can earn and claim tokens for your ambassador activities.
            </p>
          </div>

          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2 border border-[var(--border-subtle)]">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-[var(--text-primary)]">What's Coming</span>
            </div>
            <ul className="text-xs text-[var(--text-secondary)] space-y-1">
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
  )
}
