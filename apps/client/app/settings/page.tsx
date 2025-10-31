"use client"

import { NavBar } from "@/components/NavBar"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, Palette, Globe } from "lucide-react"

export default function SettingsPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <PageHeader title="Settings" description="Manage your account preferences and application settings" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive notifications about campaigns and tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about new campaigns and task completions
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get browser notifications for important updates</p>
                </div>
                <Switch id="push-notifications" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="campaign-updates">Campaign Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when campaigns you've joined have updates
                  </p>
                </div>
                <Switch id="campaign-updates" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your privacy settings and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visibility">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible on leaderboards</p>
                </div>
                <Switch id="profile-visibility" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activity-tracking">Activity Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow tracking of your campaign participation for analytics
                  </p>
                </div>
                <Switch id="activity-tracking" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for better viewing in low light</p>
                </div>
                <Switch id="dark-mode" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">Show more content in less space</p>
                </div>
                <Switch id="compact-view" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Export Data
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Download Activity Report
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Reset Preferences
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Need help with your account or have questions about campaigns?
              </p>
              <Button variant="outline" className="w-full bg-transparent">
                Contact Support
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </div>
  )
}
