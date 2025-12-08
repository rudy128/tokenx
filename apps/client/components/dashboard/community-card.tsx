"use client"

import { ChevronRight } from "lucide-react"

export interface Community {
    id: string
    name: string
    logo: string // URL or Component
    questsCount: number
    followersCount: number
    isLoyaltyProgram: boolean
    color: string
}

interface CommunityCardProps {
    community: Community
}

export function CommunityCard({ community }: CommunityCardProps) {
    return (
        <div
            className="community-card"
            style={{
                minWidth: '280px',
                maxWidth: '280px',
                height: '320px',
                background: `linear-gradient(180deg, ${community.color}20 0%, var(--bg-secondary) 100%)`,
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                scrollSnapAlign: 'start',
                borderTop: `1px solid ${community.color}40`,
                textAlign: 'center',
                gap: '1rem'
            }}
        >
            {/* Badge */}
            {community.isLoyaltyProgram && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(21, 128, 61, 0.2)',
                    color: '#4ade80',
                    border: '1px solid rgba(21, 128, 61, 0.3)',
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.02em'
                }}>
                    Loyalty Program
                </div>
            )}

            {/* Logo */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#0f172a',
                border: `2px solid ${community.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem',
                boxShadow: `0 0 30px ${community.color}40`
            }}>
                {/* Using text fallback or actual image */}
                {community.logo.startsWith('http') ? (
                    <img src={community.logo} alt={community.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                    <div style={{ fontSize: '2rem' }}>{community.logo}</div>
                )}
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {community.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {community.questsCount} Quests • {community.followersCount} Followers
                </p>
            </div>

            {/* Button */}
            <button style={{
                marginTop: 'auto',
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
            }}
                className="follow-btn"
            >
                Follow
            </button>

            <style jsx>{`
            .community-card:hover {
                background: var(--bg-elevated);
                border-color: var(--border-default);
            }
            .follow-btn:hover {
                background: var(--text-primary);
                color: var(--bg-primary);
            }
        `}</style>
        </div>
    )
}
