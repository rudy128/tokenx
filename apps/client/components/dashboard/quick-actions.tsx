"use client"

import Link from "next/link"
import { Calendar, Users, Trophy, Zap } from "lucide-react"

export function QuickActions() {
  return (
    <div className="dashboard-section-container">
      <h3 className="dashboard-section-header">
        Quick Actions
      </h3>
      <div className="card">
        <p className="dashboard-section-description">
          Complete these tasks to earn more XP
        </p>
        <div className="quick-actions-list">
          <Link href="/tasks" className="quick-action-btn">
            <Calendar className="h-5 w-5" /> 
            Check Daily Tasks
          </Link>
          
          <Link href="/campaigns" className="quick-action-btn">
            <Users className="h-5 w-5" /> 
            Browse Campaigns
          </Link>
          
          <Link href="/leaderboard" className="quick-action-btn">
            <Trophy className="h-5 w-5" /> 
            View Leaderboard
          </Link>
          
          <Link href="/rewards" className="quick-action-btn">
            <Zap className="h-5 w-5" /> 
            View Rewards
          </Link>
        </div>
      </div>
    </div>
  )
}