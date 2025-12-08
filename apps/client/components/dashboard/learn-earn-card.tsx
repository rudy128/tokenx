"use client"

import { BookOpen } from "lucide-react"

export interface LearnEarnItem {
    id: string
    title: string
    description: string
    image: string
    questsCount: number
    tag: string
}

interface LearnEarnCardProps {
    item: LearnEarnItem
}

export function LearnEarnCard({ item }: LearnEarnCardProps) {
    return (
        <div
            className="learn-earn-card"
            style={{
                minWidth: '300px',
                maxWidth: '300px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                height: '340px'
            }}
        >
            {/* Image Section */}
            <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Quests Badge */}
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '99px',
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    color: '#fff',
                    fontWeight: 500
                }}>
                    {item.questsCount} Quests
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                }}>
                    {item.title}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 'auto',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {item.description}
                </p>

                <div style={{
                    marginTop: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <div style={{
                        background: 'rgba(236, 72, 153, 0.1)', // Pinkish tint
                        border: '1px solid rgba(236, 72, 153, 0.2)',
                        borderRadius: '99px',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        color: '#f472b6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <BookOpen size={14} />
                        {item.tag}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .learn-earn-card:hover {
            transform: translateY(-4px);
            transition: transform 0.2s;
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
            border-color: var(--border-default);
        }
      `}</style>
        </div>
    )
}
