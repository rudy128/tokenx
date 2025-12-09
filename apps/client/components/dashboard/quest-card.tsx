"use client"

import { Bookmark, Users } from "lucide-react"
import Link from "next/link"

export interface Quest {
    id: string
    title: string
    subtitle: string
    image: string
    logo?: string
    tags: string[]
    participants: number
    rewardType: 'XP' | 'TOKEN' | 'NFT'
    rewardAmount: string
    rewardSecondary?: string
    isBookmarked?: boolean
    companyName: string
}

interface QuestCardProps {
    quest: Quest
}

export function QuestCard({ quest }: QuestCardProps) {
    return (
        <div
            className="group"
            style={{
                background: '#151515',
                border: '1px solid #27272a',
                borderRadius: '24px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                position: 'relative',
                fontFamily: 'system-ui, sans-serif'
            }}
        >
            {/* 1. Purple Thumbnail Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1.1/1', // Slightly taller than video to fit grid nicely
                background: '#5b21b6', // Violet-800
                borderRadius: '16px',
                overflow: 'hidden',
                // Grid Pattern Overlay
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px' // Frame Bezel
            }}>
                {/* Bookmark Icon */}
                <div style={{ position: 'absolute', top: '12px', right: '16px', zIndex: 10 }}>
                    <Bookmark fill="none" stroke="white" size={22} strokeWidth={2} />
                </div>

                {/* Inner Content Image (The "Video Thumbnail") */}
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)', // Strong shadow
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <img
                        src={quest.image}
                        alt={quest.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Participants Bubbles (Moved to Top Left) */}
                <div style={{
                    position: 'absolute',
                    top: '12px',      // Moved from bottom: 8px
                    left: '16px',     // Moved from right: 8px
                    display: 'flex',
                    alignItems: 'center',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    zIndex: 20 // Ensure it sits above other elements
                }}>
                    {/* Mock Avatars */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid #5b21b6', // match bg to blend
                            background: '#3f3f46',
                            marginLeft: i > 1 ? '-8px' : 0,
                            overflow: 'hidden',
                            zIndex: i
                        }}>
                            <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ))}
                    {/* Count Badge */}
                    <div style={{
                        height: '24px',
                        padding: '0 8px',
                        borderRadius: '12px',
                        background: '#18181b', // zinc-950
                        border: '2px solid #5b21b6', // match bg
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '-8px',
                        zIndex: 10
                    }}>
                        {(quest.participants / 1000).toFixed(1)}K
                    </div>
                </div>
            </div>

            {/* 2. Info Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px' }}>
                {/* Company Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#f97316', // Orange-500 logo bg
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Generic Logo Icon if none provided */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '0.95rem', color: '#e4e4e7', fontWeight: 600 }}>
                        {quest.companyName}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: '1.3',
                    marginTop: '4px',
                    letterSpacing: '-0.01em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '48px' // Enforce 2-line height for alignment if needed, or remove
                }}>
                    {quest.title}
                </h3>

                {/* Badges */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    {/* XP Badge */}
                    <div style={{
                        background: '#27272a',
                        borderRadius: '999px',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#f4f4f5',
                        fontWeight: 700
                    }}>
                        <div style={{ width: '14px', height: '14px', background: '#eab308', borderRadius: '50%', boxShadow: '0 0 8px rgba(234, 179, 8, 0.4)' }} />
                        {quest.rewardAmount} XPs
                    </div>

                    {/* Secondary Reward Badge */}
                    {quest.rewardSecondary && (
                        <div style={{
                            background: '#27272a',
                            borderRadius: '999px',
                            padding: '6px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.85rem',
                            color: '#f4f4f5',
                            fontWeight: 700
                        }}>
                            <div style={{ width: '12px', height: '14px', background: '#22c55e', borderRadius: '2px', boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)' }} />
                            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {quest.rewardSecondary}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
            .group:hover {
                transform: translateY(-4px);
                border-color: #3f3f46;
                box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
            }
        `}</style>
        </div>
    )
}
