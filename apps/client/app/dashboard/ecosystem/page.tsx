"use client"

import NavBar from '../../../components/NavBar'
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import Image from 'next/image'
import Link from 'next/link'

// Mock Data for Ecosystems
const ECOSYSTEMS = [
    { id: '1', name: 'Linea', logo: '/images/ecosystem/linea.png' }, // You might need to update these paths or use placeholders/icons
    { id: '2', name: 'Base', logo: '/images/ecosystem/base.png' },
    { id: '3', name: 'ZkSync', logo: '/images/ecosystem/zksync.png' },
    { id: '4', name: 'Scroll', logo: '/images/ecosystem/scroll.png' },
    { id: '5', name: 'Manta', logo: '/images/ecosystem/manta.png' },
    { id: '6', name: 'Blast', logo: '/images/ecosystem/blast.png' },
    { id: '7', name: 'Mode', logo: '/images/ecosystem/mode.png' },
    { id: '8', name: 'Polygon', logo: '/images/ecosystem/polygon.png' },
    { id: '9', name: 'Arbitrum', logo: '/images/ecosystem/arbitrum.png' },
    { id: '10', name: 'BNB Chain', logo: '/images/ecosystem/bnb.png' },
    { id: '11', name: 'Optimism', logo: '/images/ecosystem/optimism.png' },
    { id: '12', name: 'Solana', logo: '/images/ecosystem/solana.png' },
    { id: '13', name: 'Cosmos', logo: '/images/ecosystem/cosmos.png' },
    { id: '14', name: 'Bitcoin', logo: '/images/ecosystem/bitcoin.png' }
]

export default function EcosystemPage() {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <NavBar />

            <main className="dashboard-main" style={{
                maxWidth: '1280px',
                width: '100%', // Ensure full width within container
                margin: '0 auto',
                padding: '1.5rem 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                flex: 1 // Push footer to bottom
            }}>

                {/* ECOSYSTEMS Section */}
                <div style={{
                    background: '#07101e', // Dark blue-ish bg from screenshot
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #1e293b' // Subtle border
                }}>
                    <h2 style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '1.5rem'
                    }}>
                        Ecosystems
                    </h2>

                    <div style={{
                        padding: '1rem', // Inner padding
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        {ECOSYSTEMS.map((eco) => (
                            <Link href={`/dashboard/ecosystem/${eco.id}`} key={eco.id} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    width: '100px', // Approximate square size
                                    height: '100px',
                                    background: '#0b1626', // slightly lighter blue-black for item
                                    border: '1px solid #1e293b',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                    className="ecosystem-item-hover"
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        marginBottom: '8px',
                                        background: '#1e293b', // Placeholder bg
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {/* Using a generic SVG if image fails, but ideally mapping logos */}
                                        {/* For now, just a placeholder circle or try to use an icon library if available */}
                                        <span style={{ fontSize: '10px', color: '#aaa' }}>Logo</span>
                                    </div>

                                    {/* Only show name if we want, screenshot shows some have names under logo? 
                                    Actually looking at screenshot, most don't have text, just logo. 
                                    Except maybe the first one 'Linea'? 
                                    I will add name conditionally or for all but styled subtly.
                                */}
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        fontWeight: 500
                                    }}>
                                        {eco.name}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <style jsx>{`
                    .ecosystem-item-hover:hover {
                         border-color: #3b82f6;
                         transform: translateY(-2px);
                         background: #111f35;
                    }
                `}</style>

            </main>
            <DashboardFooter />
        </div>
    )
}
