"use client"

import { Bookmark, MoreHorizontal } from "lucide-react"

export interface TokenQuest {
    id: string
    icon: any // Lucide icon or image url
    iconColor: string
    iconBg: string
    companyName: string
    title: string
    stats: string
    rewards: { xp: string; token: string }
}

interface TokenQuestCardProps {
    quest: TokenQuest
}

export function TokenQuestCard({ quest }: TokenQuestCardProps) {
    const Icon = quest.icon

    return (
        <div
            className="token-quest-card"
            style={{
                minWidth: '300px',
                maxWidth: '300px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <div className="dot" style={{ background: '#d946ef' }} />
                    <div className="dot" style={{ background: '#a855f7' }} />
                    <div className="dot" style={{ background: '#8b5cf6' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-tertiary)' }}>
                    <span style={{ fontSize: '0.75rem' }}>{quest.stats}</span>
                    <Bookmark size={18} />
                </div>
            </div>

            {/* Main Icon - Centered */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '1rem 0'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: quest.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 40px ${quest.iconBg}`
                }}>
                    {/* If Icon is a string (URL), render img, else render component */}
                    {typeof Icon === 'string' ? (
                        <img src={Icon} alt="" style={{ width: '40px', height: '40px' }} />
                    ) : (
                        <Icon size={40} color={quest.iconColor} />
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F97316' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {quest.companyName}
                    </span>
                </div>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.4
                }}>
                    {quest.title}
                </h3>
            </div>

            {/* Footer Rewards */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <div style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    borderRadius: '99px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24' }} />
                    {quest.rewards.xp}
                </div>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '99px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    color: '#60a5fa',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }} />
                    {quest.rewards.token}
                </div>
            </div>

            <style jsx>{`
        .dot {
            width: 8px;
            height: 8px;
            borderRadius: 50%;
        }
        .token-quest-card:hover {
            border-color: var(--border-default);
            background: var(--bg-elevated);
        }
      `}</style>
        </div>
    )
}
