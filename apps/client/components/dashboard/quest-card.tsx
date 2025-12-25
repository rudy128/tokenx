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
            className="quest-card"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative'
            }}
        >
            {/* Image Section */}
            <div style={{
                height: '180px',
                width: '100%',
                position: 'relative',
                background: 'var(--bg-tertiary)', // placeholder
            }}>
                <img
                    src={quest.image}
                    alt={quest.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Overlay Gradient */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)'
                }} />

                {/* Top Tags */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Users size={12} />
                        {(quest.participants / 1000).toFixed(1)}k
                    </div>
                </div>

                <button style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer'
                }}>
                    <Bookmark size={16} />
                </button>
            </div>

            {/* Content Section */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Company Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#FF5722', // Mock Brand Color
                        flexShrink: 0
                    }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{quest.companyName}</span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 'auto',
                    lineHeight: 1.4
                }}>
                    {quest.title}
                    <br />
                    <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
                        {quest.subtitle}
                    </span>
                </h3>

                {/* Rewards */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <div style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        color: '#EAB308',
                        border: '1px solid rgba(234, 179, 8, 0.2)',
                        borderRadius: '99px',
                        padding: '4px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EAB308' }} />
                        {quest.rewardAmount} XPs
                    </div>

                    {quest.rewardSecondary && (
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3B82F6',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            borderRadius: '99px',
                            padding: '4px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
                            {quest.rewardSecondary}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
            .quest-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
                border-color: var(--border-default);
            }
        `}</style>
        </div>
    )
}
