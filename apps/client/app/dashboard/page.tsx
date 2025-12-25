"use client"

import NavBar from '../../components/NavBar';
import { HeroCarousel, HeroSlide } from "@/components/dashboard/hero-carousel";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { QuestCard, Quest } from "@/components/dashboard/quest-card";
import { ContinueQuestCard } from "@/components/dashboard/continue-quest-card";
import { TokenQuestCard, TokenQuest } from "@/components/dashboard/token-quest-card";
import { CommunityCard, Community } from "@/components/dashboard/community-card";
import { NftCard, NftItem } from "@/components/dashboard/nft-card";
import { EcosystemCard, EcosystemItem } from "@/components/dashboard/ecosystem-card";
import { LearnEarnCard, LearnEarnItem } from "@/components/dashboard/learn-earn-card";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { HorizontalScroll } from "@/components/dashboard/horizontal-scroll";
import { Flame, DollarSign, Hexagon, Zap, Layers, Box, ScrollText, Fingerprint, Timer, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

// Mock Data
const HERO_SLIDES: HeroSlide[] = [
  {
    id: "1",
    title: "WIN BIG with Travala!",
    subtitle: "Adventure Awaits!",
    description: "$200 USDT",
    image: "https://images.unsplash.com/photo-1549558549-415fe4c37b60?q=80&w=2619&auto=format&fit=crop",
    ctaText: "Play Now",
    ctaLink: "/campaigns/travala",
    partners: [{ name: "Travala.com" }, { name: "Intract" }],
    color: "#7C3AED"
  },
  {
    id: "2",
    title: "Eco-System Airdrop",
    subtitle: "Limited Time",
    description: "50,000 TOKENS",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop",
    ctaText: "Join Now",
    ctaLink: "/campaigns/airdrop",
    partners: [{ name: "TokenX" }],
    color: "#2563EB"
  }
];

const AIRDROPS: Quest[] = [
  {
    id: "1",
    title: "Haust Network: White List",
    subtitle: "HUB Leaderboard Challenge - 2000 USDT Up for Grabs",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1639322537228-ad7117a394ec?q=80&w=2650&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 28500,
    rewardType: "TOKEN",
    rewardAmount: "150",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "2",
    title: "The First Onchain Treasury Network for Web3",
    subtitle: "Treasury Challenge",
    companyName: "Colahaft",
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 28500,
    rewardType: "TOKEN",
    rewardAmount: "150",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  }
];

const BUZZING: Quest[] = [
  {
    id: "3",
    title: "USUAL Airdrop Guide",
    subtitle: "Discover how to collect pills points",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 12400,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "4",
    title: "Mastering Squid Router",
    subtitle: "Seamless cross-chain token swaps",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 8900,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "5",
    title: "Unveiling Zest Protocol",
    subtitle: "Revolutionizing Bitcoin Lending",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2555&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 4500,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "6",
    title: "Introduction to Sui",
    subtitle: "Participate and earn exclusive incentives",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?q=80&w=2632&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 32000,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  }
];

const DAILY_ALPHA: Quest[] = [
  {
    id: "7",
    title: "Join the $500 Suede Labs sprint today",
    subtitle: "Discover how to collect points towards Suede",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1614850523060-8da1d56e37ad?q=80&w=2670&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 5200,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "8",
    title: "HUB Portal Chat",
    subtitle: "Chat Early, Earn More",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=2670&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 1200,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "9",
    title: "Frens of Semester Scemr",
    subtitle: "Memes are great again",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?q=80&w=2680&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 800,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  },
  {
    id: "10",
    title: "Introduction to Injective",
    subtitle: "Learn about the fastest layer 1",
    companyName: "HUB Ecosystem",
    image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2670&auto=format&fit=crop",
    tags: ["28.5k"],
    participants: 4500,
    rewardType: "TOKEN",
    rewardAmount: "150 XPs",
    rewardSecondary: "100K HUB",
    isBookmarked: false
  }
]

const TOKEN_QUESTS: TokenQuest[] = [
  {
    id: '1',
    icon: DollarSign,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.2)',
    companyName: 'BeraFarm',
    title: 'Haust Network: Explore the Possibilities',
    stats: '28.5k',
    rewards: { xp: '150 XPs', token: '500 Binance-Peg...' }
  },
  {
    id: '2',
    icon: Hexagon,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.2)',
    companyName: 'BeraFarm',
    title: 'Haust Network: Explore the Possibilities',
    stats: '28.5k',
    rewards: { xp: '150 XPs', token: '500 Binance-Peg...' }
  },
  {
    id: '3',
    icon: DollarSign,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59, 130, 246, 0.2)',
    companyName: 'BeraFarm',
    title: 'Haust Network: Explore the Possibilities',
    stats: '28.5k',
    rewards: { xp: '150 XPs', token: '500 Binance-Peg...' }
  },
  {
    id: '4',
    icon: Hexagon,
    iconColor: '#10B981',
    iconBg: 'rgba(16, 185, 129, 0.2)',
    companyName: 'BeraFarm',
    title: 'Haust Network: Explore the Possibilities',
    stats: '28.5k',
    rewards: { xp: '150 XPs', token: '500 Binance-Peg...' }
  }
];

const COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'PolyFlow',
    logo: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2574&auto=format&fit=crop',
    questsCount: 12,
    followersCount: 5746,
    isLoyaltyProgram: true,
    color: '#6366f1'
  },
  {
    id: '2',
    name: 'PolyFlow',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    questsCount: 12,
    followersCount: 5746,
    isLoyaltyProgram: true,
    color: '#a855f7'
  },
  {
    id: '3',
    name: 'PolyFlow',
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
    questsCount: 12,
    followersCount: 5746,
    isLoyaltyProgram: true,
    color: '#ec4899'
  },
  {
    id: '4',
    name: 'PolyFlow',
    logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
    questsCount: 12,
    followersCount: 5746,
    isLoyaltyProgram: true,
    color: '#3b82f6'
  }
];

const NFTS: NftItem[] = [
  {
    id: '1',
    title: 'Cosmic Visionary',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2819&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 7100,
    total: 10000,
    isLiked: false
  },
  {
    id: '2',
    title: 'Geometric Dreams',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2694&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 2400,
    total: 10000,
    isLiked: true
  },
  {
    id: '3',
    title: 'Digital Horizon',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    category: 'Scifi',
    price: 'Free',
    minted: 5200,
    total: 8000,
    isLiked: false
  },
  {
    id: '4',
    title: 'Neon Genesis',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2670&auto=format&fit=crop',
    category: 'Cyberpunk',
    price: '0.05 ETH',
    minted: 1200,
    total: 2000,
    isLiked: false
  }
]

const ECOSYSTEM: EcosystemItem[] = [
  { id: '1', logo: Zap, color: '#fff', bg: '#1e293b' }, // Dark Blue/Slate
  { id: '2', logo: Layers, color: '#fff', bg: '#7c3aed' }, // Purple
  { id: '3', logo: Box, color: '#fff', bg: '#fbbf24' }, // Yellow
  { id: '4', logo: ScrollText, color: '#fff', bg: '#334155' }, // Slate
  { id: '5', logo: Hexagon, color: '#fff', bg: '#d97706' }, // Amber
]

// New Data
const CONTINUE_QUESTS: { quest: Quest; progress: number; color: string }[] = [
  {
    quest: {
      id: 'c1',
      title: 'Haust Network',
      subtitle: 'HUB Leaderboard Challenge - 2000 USDT Up for Grabs',
      companyName: 'HUB Ecosystem',
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
      tags: ["28.5k"],
      participants: 28500,
      rewardType: "TOKEN",
      rewardAmount: "150",
      rewardSecondary: "100K HUB",
      isBookmarked: false
    },
    progress: 75,
    color: '#d946ef'
  },
  {
    quest: {
      id: 'c2',
      title: 'Haust Network',
      subtitle: 'HUB Leaderboard Challenge - 2000 USDT Up for Grabs',
      companyName: 'HUB Ecosystem',
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
      tags: ["28.5k"],
      participants: 28500,
      rewardType: "TOKEN",
      rewardAmount: "150",
      rewardSecondary: "100K HUB",
      isBookmarked: false
    },
    progress: 45,
    color: '#a855f7'
  }
]

const NFT_QUESTS: NftItem[] = [
  {
    id: 'n1',
    title: 'Cosmic Visionary',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=2664&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 7100,
    total: 10000,
    isLiked: true
  },
  {
    id: 'n2',
    title: 'Cosmic Visionary',
    image: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2574&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 7100,
    total: 10000,
    isLiked: false
  },
  {
    id: 'n3',
    title: 'Cosmic Visionary',
    image: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?q=80&w=2564&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 7100,
    total: 10000,
    isLiked: true
  },
  {
    id: 'n4',
    title: 'Cosmic Visionary',
    image: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?q=80&w=2574&auto=format&fit=crop',
    category: 'Abstract',
    price: 'Free',
    minted: 7100,
    total: 10000,
    isLiked: true
  }
]

const LEARN_EARN: LearnEarnItem[] = [
  {
    id: 'l1',
    title: 'Exploring testnets',
    description: 'Dive into the world of testnets and get the best out of it by being early into',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop',
    questsCount: 1,
    tag: 'Also Explorer'
  },
  {
    id: 'l2',
    title: 'Exploring testnets',
    description: 'Dive into the world of testnets and get the best out of it by being early into',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2670&auto=format&fit=crop',
    questsCount: 1,
    tag: 'Also Explorer'
  },
  {
    id: 'l3',
    title: 'Exploring testnets',
    description: 'Dive into the world of testnets and get the best out of it by being early into',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
    questsCount: 1,
    tag: 'Also Explorer'
  },
  {
    id: 'l4',
    title: 'Exploring testnets',
    description: 'Dive into the world of testnets and get the best out of it by being early into',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
    questsCount: 1,
    tag: 'Also Explorer'
  }
]

export default function DashboardPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff' }}>
      <NavBar />

      <main className="dashboard-main" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 2rem 2rem 2rem' }}>

        {/* Top Section: Hero + Right Stack */}
        <div className="hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Main Hero Carousel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
            <HeroCarousel slides={HERO_SLIDES} />
          </div>

          {/* Right Sidebar Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* 1. Proof of Humanity Card */}
            <div style={{
              background: '#09090b',
              border: '1px solid #1e1e24',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              position: 'relative',
              overflow: 'hidden',
              height: '160px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              {/* Scanline Background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(168, 85, 247, 0.03) 3px)',
                pointerEvents: 'none'
              }} />

              {/* Purple Glow */}
              <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '80px',
                background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
                pointerEvents: 'none'
              }} />

              {/* Icon Area */}
              <div style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Viewfinder Corners */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '8px', borderTop: '2px solid rgba(168, 85, 247, 0.6)', borderLeft: '2px solid rgba(168, 85, 247, 0.6)' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderTop: '2px solid rgba(168, 85, 247, 0.6)', borderRight: '2px solid rgba(168, 85, 247, 0.6)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '8px', height: '8px', borderBottom: '2px solid rgba(168, 85, 247, 0.6)', borderLeft: '2px solid rgba(168, 85, 247, 0.6)' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderBottom: '2px solid rgba(168, 85, 247, 0.6)', borderRight: '2px solid rgba(168, 85, 247, 0.6)' }} />

                <Fingerprint size={28} color="#c084fc" />
              </div>

              <div style={{
                fontSize: '1rem',
                color: '#e9d5ff',
                fontWeight: 500,
                letterSpacing: '0.02em',
                zIndex: 2
              }}>
                Proof of Humanity
              </div>
            </div>

            {/* 2. Speedrun & NFTs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Speedrun */}
              <div style={{
                background: '#09090b',
                border: '1px solid #1e1e24',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.5rem',
                height: '110px'
              }}>
                <Timer size={24} className="text-gray-400" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>Speedrun</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Win assured rewards</span>
                </div>
              </div>

              {/* NFTs */}
              <div style={{
                background: '#09090b',
                border: '1px solid #1e1e24',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '0.5rem',
                height: '110px'
              }}>
                <ImageIcon size={24} className="text-gray-400" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>NFTs</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mint Now</span>
                </div>
              </div>
            </div>

            {/* 3. Unlock Rewards Card */}
            <div style={{
              background: '#09090b',
              border: '1px solid #1e1e24',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                  Unlock Incredible Rewards
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  Explore, learn and start earning today
                </p>
              </div>

              <Link href="/auth/signin">
                <button className="btn" style={{
                  width: '100%',
                  background: '#7c3aed', // Violet-600
                  color: 'white',
                  fontWeight: 600,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}>
                  Sign In
                </button>
              </Link>
            </div>

          </div >
        </div >

        {/* Filters */}
        < div style={{ marginBottom: '2rem' }
        }>
          <FilterBar activeFilter="recommended" onFilterChange={(id) => console.log(id)} />
        </div >

        {/* Airdrop Opportunities */}
        < HorizontalScroll title="Airdrop Opportunities" >
          {
            AIRDROPS.map(quest => (
              <div key={quest.id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                <QuestCard quest={quest} />
              </div>
            ))
          }
          {
            AIRDROPS.map(quest => (
              <div key={quest.id + '_dup'} style={{ minWidth: '320px', maxWidth: '320px' }}>
                <QuestCard quest={{ ...quest, id: quest.id + '_dup' }} />
              </div>
            ))
          }
        </HorizontalScroll >

        {/* Buzzing Expeditions */}
        < HorizontalScroll title="Buzzing Expeditions" >
          {
            BUZZING.map(quest => (
              <div key={quest.id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                <QuestCard quest={quest} />
              </div>
            ))
          }
        </HorizontalScroll >

        {/* Token Quests */}
        < HorizontalScroll title="Token Quests" >
          {
            TOKEN_QUESTS.map(quest => (
              <TokenQuestCard key={quest.id} quest={quest} />
            ))
          }
        </HorizontalScroll >

        {/* Trending Communities */}
        < HorizontalScroll title="Trending Communities" >
          {
            COMMUNITIES.map(community => (
              <CommunityCard key={community.id} community={community} />
            ))
          }
        </HorizontalScroll >

        {/* Daily New Alpha */}
        < HorizontalScroll title="Daily New Alpha for You" >
          {
            DAILY_ALPHA.map(quest => (
              <div key={quest.id} style={{ minWidth: '320px', maxWidth: '320px' }}>
                <QuestCard quest={quest} />
              </div>
            ))
          }
        </HorizontalScroll >

        {/* Engaging NFTs */}
        < HorizontalScroll title="Engaging NFTs" >
          {
            NFTS.map(item => (
              <NftCard key={item.id} item={item} />
            ))
          }
        </HorizontalScroll >

        {/* Ecosystem */}
        < HorizontalScroll title="Ecosystem" >
          {
            ECOSYSTEM.map(item => (
              <EcosystemCard key={item.id} item={item} />
            ))
          }
        </HorizontalScroll >

        {/* Continue Where you left off */}
        < HorizontalScroll title="Continue where you left ..." >
          {
            CONTINUE_QUESTS.map(item => (
              <ContinueQuestCard
                key={item.quest.id}
                quest={item.quest}
                progress={item.progress}
                color={item.color}
              />
            ))
          }
        </HorizontalScroll >

        {/* NFT Quests (New Section) */}
        < HorizontalScroll title="NFT Quests" >
          {
            NFT_QUESTS.map(item => (
              <NftCard key={item.id} item={item} />
            ))
          }
        </HorizontalScroll >

        {/* Learn and Earn (New Section) */}
        < HorizontalScroll title="Learn and Earn" >
          {
            LEARN_EARN.map(item => (
              <LearnEarnCard key={item.id} item={item} />
            ))
          }
        </HorizontalScroll >

        <DashboardFooter />

      </main >

      <style jsx global>{`
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div >
  );
}
