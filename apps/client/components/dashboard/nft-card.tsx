"use client"

import { Heart, User } from "lucide-react"

export interface NftItem {
    id: string
    title: string
    image: string
    category: string
    price: string
    minted: number
    total: number
    isLiked?: boolean
}

interface NftCardProps {
    item: NftItem
}

export function NftCard({ item }: NftCardProps) {
    return (
        <div
            className="nft-card"
            style={{
                minWidth: '300px',
                maxWidth: '300px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                scrollSnapAlign: 'start'
            }}
        >
            {/* Image Container */}
            <div style={{ position: 'relative', height: '280px', width: '100%' }}>
                <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Like Button */}
                <button style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                }}>
                    <Heart size={16} fill={item.isLiked ? "#fff" : "none"} />
                </button>

                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    marginTop: '2rem', // position below like button? or maybe just top right specific?
                    // Actually looking at design, it's just the heart top right. 
                    // Wait, there is a number 7.1k? hard to see. Let's stick to heart.
                }} />
            </div>

            {/* Content */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                    </h3>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '99px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10B981' }} />
                        {item.category}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.price}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                        <User size={14} />
                        <span>{(item.minted / 1000).toFixed(1)}K/{item.total / 1000}K</span>
                    </div>
                </div>

                <button style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'background 0.2s'
                }}
                    className="mint-btn"
                >
                    Mint
                </button>
            </div>

            <style jsx>{`
        .mint-btn:hover {
            background: rgba(255,255,255,0.2) !important;
        }
        .nft-card:hover {
            transform: translateY(-4px);
            transition: transform 0.2s;
            box-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
        }
      `}</style>
        </div>
    )
}
