"use client"

import { UserPlus } from "lucide-react"

export interface EcosystemItem {
    id: string
    logo: any // Lucide Icon or image url
    color: string
    bg: string
}

interface EcosystemCardProps {
    item: EcosystemItem
}

export function EcosystemCard({ item }: EcosystemCardProps) {
    const Icon = item.logo

    return (
        <div
            className="ecosystem-card"
            style={{
                minWidth: '240px',
                maxWidth: '240px',
                height: '160px',
                background: item.bg,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                overflow: 'hidden'
            }}
        >
            {/* Top Right Action */}
            <button style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.2)',
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
                <UserPlus size={16} />
            </button>

            {/* Main Logo Container */}
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            }}>
                {typeof Icon === 'string' ? (
                    <img src={Icon} alt="" style={{ width: '32px', height: '32px' }} />
                ) : (
                    <Icon size={32} color="#fff" />
                )}
            </div>

            <style jsx>{`
            .ecosystem-card:hover {
                transform: scale(1.02);
                transition: transform 0.2s;
            }
       `}</style>
        </div>
    )
}
