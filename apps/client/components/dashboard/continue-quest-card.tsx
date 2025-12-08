"use client"

import { Bookmark, Users } from "lucide-react"
import { Quest } from "./quest-card"

interface ContinueQuestCardProps {
    quest: Quest
    progress: number
    color: string
}

export function ContinueQuestCard({ quest, progress, color }: ContinueQuestCardProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px', scrollSnapAlign: 'start' }}>
            <div
                className="continue-card"
                style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    borderBottom: `2px solid ${color}` // Highlight border at bottom
                }}
            >
                {/* Image Section */}
                <div style={{
                    height: '180px',
                    width: '100%',
                    position: 'relative',
                    background: 'var(--bg-tertiary)',
                }}>
                    <img
                        src={quest.image}
                        alt={quest.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, ${color}40 100%)` // Subtle colored tint at bottom
                    }} />

                    {/* Tags */}
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
                            {quest.tags[0]}
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

                {/* Content */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F97316' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{quest.companyName}</span>
                    </div>

                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '1rem',
                        lineHeight: 1.4
                    }}>
                        {quest.subtitle}
                    </h3>

                    {/* Rewards */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
                        <div style={{
                            background: 'rgba(234, 179, 8, 0.1)',
                            color: '#EAB308',
                            border: '1px solid rgba(234, 179, 8, 0.2)',
                            borderRadius: '99px',
                            padding: '2px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EAB308' }} />
                            {quest.rewardAmount} XPs
                        </div>

                        {quest.rewardSecondary && (
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3B82F6',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '99px',
                                padding: '2px 10px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                                {quest.rewardSecondary}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Progress Bar Outside Card */}
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: color, borderRadius: '99px' }} />
            </div>

            <style jsx>{`
            .continue-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 30px -10px rgba(0,0,0,0.3);
            }
        `}</style>
        </div>
    )
}
