"use client"

import Link from "next/link"
import { Fingerprint, Zap, Hexagon, ArrowRight } from "lucide-react"

export function DashboardSidebar() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>

            {/* Proof of Humanity Card */}
            <div className="sidebar-card hover-glow" style={{
                background: 'linear-gradient(180deg, rgba(30,27,75,0.8) 0%, rgba(13,14,18,0.9) 100%)',
                border: '1px solid rgba(124, 58, 237, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '120px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Scan line effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'rgba(124, 58, 237, 0.8)',
                    boxShadow: '0 0 10px rgba(124, 58, 237, 0.8)',
                    animation: 'scan 3s infinite linear'
                }} />

                <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: 'rgba(124, 58, 237, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(124, 58, 237, 0.4)'
                }}>
                    <Fingerprint className="text-purple-400" size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Proof of Humanity</h3>
            </div>

            {/* Mini Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                {/* Speedrun */}
                <div className="sidebar-card hover-lift" style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <Zap size={20} className="text-yellow-400" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Speedrun</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Win assured rewards</div>
                    </div>
                </div>

                {/* NFTs */}
                <div className="sidebar-card hover-lift" style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <Hexagon size={20} className="text-blue-400" />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>NFTs</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Mint Now</div>
                    </div>
                </div>
            </div>

            {/* Sign In CTA */}
            <div className="sidebar-card" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1
            }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Unlock Incredible Rewards
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Explore, learn and start earning today
                    </p>
                </div>
                <Link href="/auth/signin" style={{ width: '100%' }}>
                    <button className="btn" style={{
                        width: '100%',
                        background: '#8B5CF6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        Sign In
                    </button>
                </Link>
            </div>

            <style jsx>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .hover-lift {
            transition: transform 0.2s;
            cursor: pointer;
        }
        .hover-lift:hover {
            transform: translateY(-2px);
            border-color: var(--border-default);
        }
      `}</style>
        </div>
    )
}
