import { NavBar } from "@/components/NavBar";
import { PageHeader } from "@/components/layout/page-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Users, Trophy, Zap, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

// Types
interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: string;
  tier: string;
  xp: number;
  tokenBalance: number;
  usdtBalance: number;
  CampaignParticipation: CampaignParticipation[];
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface CampaignParticipation {
  id: string;
  userId: string;
  campaignId: string;
  status: string;
  joinedAt: Date;
  xpEarned: number | null;
  Campaign: Campaign;
}

type UserWithCampaigns = User;

async function getUserStats(
  userId: string,
  userEmail?: string,
  userName?: string
): Promise<{ user: UserWithCampaigns; activeCampaigns: number; totalCampaigns: number } | null> {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      CampaignParticipation: {
        include: {
          Campaign: true,
        },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: userEmail || `user-${userId}@example.com`,
        name: userName || "New User",
        role: "AMBASSADOR",
        tier: "BRONZE",
        xp: 0,
        tokenBalance: 0,
        usdtBalance: 0,
      },
      include: {
        CampaignParticipation: {
          include: {
            Campaign: true,
          },
        },
      },
    });
  }

  const activeCampaigns = user.CampaignParticipation.filter(
    (p: any) => p.Campaign.status === "ACTIVE"
  ).length;
  const totalCampaigns = user.CampaignParticipation.length;

  return {
    user: user as any,
    activeCampaigns,
    totalCampaigns,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userStats = await getUserStats(
    session.user.id,
    session.user.email || undefined,
    session.user.name || undefined
  );
  if (!userStats) {
    redirect("/auth/signin");
  }
  const { user, activeCampaigns } = userStats;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <NavBar />
      <main className="dashboard-main">
      <PageHeader
        title={`Welcome back, ${user.name || user.email}!`}
        description="Here's what's happening with your campaigns today."
      />

      {/* STATS GRID */}
      <div className="stat-cards-row">
          {/* Total XP Card */}
          <div className="stat-card stat-card-primary">
            <div className="stat-card-icon">
              <Star className="h-6 w-6" />
            </div>
            <span className="stat-card-label">TOTAL XP</span>
            <span className="stat-card-value">{user.xp.toLocaleString()}</span>
            <span className="stat-card-meta">{user.tier} TIER</span>
          </div>

          {/* Active Campaigns Card */}
          <div className="stat-card stat-card-success">
            <div className="stat-card-icon">
              <Users className="h-6 w-6" />
            </div>
            <span className="stat-card-label">ACTIVE CAMPAIGNS</span>
            <span className="stat-card-value">{activeCampaigns}</span>
            <span className="stat-card-meta">CAMPAIGNS</span>
          </div>

          {/* Leaderboard Card */}
          <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
            <div className="stat-card stat-card-warning">
              <div className="stat-card-icon">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="stat-card-label">LEADERBOARD</span>
              <span className="stat-card-value">-</span>
              <span className="stat-card-meta">VIEW RANKING</span>
            </div>
          </Link>

          {/* Token Balance Card */}
          <div className="stat-card stat-card-info">
            <div className="stat-card-icon">
              <Zap className="h-6 w-6" />
            </div>
            <span className="stat-card-label">TOKEN BALANCE</span>
            <span className="stat-card-value">{user.tokenBalance.toLocaleString()}</span>
            <span className="stat-card-meta">TOKENS</span>
          </div>
        </div>

      {/* CONTENT GRID */}
      <div className="dashboard-content-grid">
        {/* RECENT CAMPAIGNS */}
        <div className="dashboard-section-container">
          <h2 className="dashboard-section-header">
            Recent Campaigns
          </h2>
          <div className="card">
            {user.CampaignParticipation.length > 0 ? (
              <div className="dashboard-section-content">
                {user.CampaignParticipation.slice(0, 3).map((participation: CampaignParticipation) => (
                  <div 
                    key={participation.id} 
                    className="campaign-item"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="campaign-name">
                          {participation.Campaign.name}
                        </p>
                        <p className="campaign-description">
                          {participation.Campaign.description}
                        </p>
                      </div>
                      <div className="campaign-status">
                        <span
                          className={
                            participation.Campaign.status === 'ACTIVE' 
                              ? 'badge badge-success' 
                              : 'badge badge-info'
                          }
                        >
                          {participation.Campaign.status}
                        </span>
                        <p className="campaign-participation-status">
                          {participation.status}
                        </p>
                      </div>
                    </div>
                    <div className="campaign-meta">
                      <span>Joined: {new Date(participation.joinedAt).toLocaleDateString()}</span>
                      <span>XP Earned: {participation.xpEarned || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <p className="empty-state-text">
                  No campaigns yet
                </p>
                <Link href="/campaigns">
                  <button className="btn btn-primary">
                    Join a Campaign
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <QuickActions />
        </div>
      </main>
    </div>
  );
}
