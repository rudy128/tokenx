"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import NavBar from '../../../../components/NavBar'
import { DashboardFooter } from "@/components/dashboard/dashboard-footer"
import { Globe, Twitter, UserPlus, Home, LayoutGrid, Trophy, Hexagon, User, ChevronLeft, ChevronRight, Circle } from "lucide-react"

// Mock Data for specific Ecosystem
const MOCK_ECOSYSTEM_DATA = {
    id: 'linea',
    name: 'Linea',
    logo: '/images/ecosystem/linea.png',
    description: "Linea is a scalable, cost-effective, and developer-friendly Layer-2 solution on the Ethereum network...",
    participants: "15K",
    coverImage: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop"
}

const MOCK_PROJECTS = [
    { id: 1, name: 'PolyFlow', quests: 12, followers: 5746 },
    { id: 2, name: 'PolyFlow', quests: 12, followers: 5746 },
    { id: 3, name: 'PolyFlow', quests: 12, followers: 5746 },
]

const MOCK_LEADERBOARD = [
    { rank: 1, username: 'elsape', xp: '83.7k', avatar: 'https://i.pravatar.cc/150?u=elsape' },
    { rank: 2, username: 'elsape', xp: '83.7k', avatar: 'https://i.pravatar.cc/150?u=elsape2' },
    { rank: 3, username: 'elsape', xp: '83.7k', avatar: 'https://i.pravatar.cc/150?u=elsape3' },
]

export default function EcosystemIdPage() {
    const params = useParams()
    const [activeTab, setActiveTab] = useState('home')

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#09090b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <NavBar />

            <main style={{
                flex: 1,
                width: '100%',
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '1.5rem 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>

                {/* Hero Banner Section */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '480px', // Increased height to prevent cutoff
                    background: `linear-gradient(to bottom, rgba(0,0,0,0.3), #09090b), url('${MOCK_ECOSYSTEM_DATA.coverImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #27272a'
                }}>

                    {/* Follow Button */}
                    <button style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}>
                        <UserPlus size={16} />
                        Follow
                    </button>

                    {/* Content Stack */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        maxWidth: '600px',
                        marginTop: '2rem'
                    }}>
                        {/* Logo Circle */}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#000',
                            border: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>L</span>
                        </div>

                        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>
                            {MOCK_ECOSYSTEM_DATA.name}
                        </h1>

                        <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '500px' }}>
                            {MOCK_ECOSYSTEM_DATA.description}
                            <span style={{ color: '#a855f7', marginLeft: '4px', cursor: 'pointer' }}>See more</span>
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Participants
                                </span>
                                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                                    {MOCK_ECOSYSTEM_DATA.participants}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                    Social Links
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}>
                                        <Twitter size={14} fill="currentColor" strokeWidth={0} />
                                    </div>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}>
                                        <Globe size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '3rem',
                            display: 'flex',
                            gap: '8px',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            padding: '4px',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {/* Tabs */}
                            {[
                                { id: 'home', label: 'Home', icon: Home },
                                { id: 'projects', label: 'Projects', icon: LayoutGrid },
                                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        background: activeTab === tab.id ? '#2e2e32' : 'transparent',
                                        color: activeTab === tab.id ? '#fff' : '#a1a1aa',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                {activeTab === 'projects' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                            Cubane projects building on {MOCK_ECOSYSTEM_DATA.name}
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {MOCK_PROJECTS.map((project) => (
                                <div key={project.id} style={{
                                    background: 'linear-gradient(180deg, #050a18 0%, #000000 100%)', // Deep blue-black gradient
                                    borderRadius: '20px',
                                    border: '1px solid #1e293b',
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Loyalty Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '1.5rem',
                                        right: '1.5rem',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        color: '#10b981',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        padding: '4px 12px',
                                        borderRadius: '6px'
                                    }}>
                                        Loyalty Program
                                    </div>

                                    {/* Logo & Info */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '50%',
                                            background: '#f97316', // Orange placeholder
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem',
                                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                                        }}>
                                            <Hexagon fill="white" stroke="none" size={32} />
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, marginBottom: '6px' }}>
                                            {project.name}
                                        </h3>
                                        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>
                                            {project.quests} Quests • {project.followers} Followers
                                        </p>
                                    </div>

                                    {/* Follow Button */}
                                    <button style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '12px',
                                        background: '#1f2937',
                                        border: 'none',
                                        color: '#fff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        marginTop: 'auto'
                                    }}>
                                        Follow
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Leaderboard Section */}
                {activeTab === 'leaderboard' && (
                    <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                        <div style={{
                            background: '#0a0a0d', // Deep dark bg
                            borderRadius: '16px',
                            border: '1px solid #1e293b',
                            overflow: 'hidden'
                        }}>
                            {/* Header */}
                            <div style={{
                                padding: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderBottom: '1px solid #1e293b'
                            }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Players</h2>
                                <div style={{
                                    background: '#27272a',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.85rem',
                                    color: '#a1a1aa'
                                }}>
                                    <User size={14} /> 0
                                </div>
                            </div>

                            {/* Table Header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '80px 1fr auto',
                                padding: '1rem 2rem',
                                color: '#a1a1aa',
                                fontSize: '0.85rem',
                                fontWeight: 500
                            }}>
                                <div>#</div>
                                <div>Username</div>
                                <div style={{ textAlign: 'right' }}>XPs</div>
                            </div>

                            {/* Table Rows */}
                            <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {MOCK_LEADERBOARD.map((item) => (
                                    <div key={item.rank} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '80px 1fr auto',
                                        alignItems: 'center',
                                        padding: '12px 1rem',
                                        background: '#151518', // Slightly lighter than container
                                        borderRadius: '12px',
                                        border: '1px solid #27272a',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer'
                                    }}
                                        className="leaderboard-row"
                                    >
                                        {/* Rank */}
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            background: '#facc15', // Yellow/Gold
                                            color: '#000',
                                            fontWeight: 700,
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem'
                                        }}>
                                            {item.rank}
                                        </div>

                                        {/* User */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                border: '1px solid #3f3f46'
                                            }}>
                                                <img src={item.avatar} alt={item.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.username}</span>
                                        </div>

                                        {/* XP Badge */}
                                        <div style={{
                                            background: '#27272a',
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.9rem',
                                            fontWeight: 600
                                        }}>
                                            <Circle size={10} fill="#facc15" stroke="none" />
                                            {item.xp}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Pagination */}
                            <div style={{
                                padding: '1rem 2rem',
                                background: '#151518',
                                borderTop: '1px solid #1e293b',
                                display: 'flex',
                                justifyContent: 'space-between', // Changed to space-between as usually pagination is on right or spread?
                                // Actually screenshot shows it left aligned "Page 1 of 0" then buttons next to it.
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    color: '#a1a1aa',
                                    fontSize: '0.9rem'
                                }}>
                                    <span>Page 1 of 0</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button style={{
                                            background: '#27272a', border: 'none', borderRadius: '6px',
                                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#71717a', cursor: 'not-allowed'
                                        }}>
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button style={{
                                            background: '#27272a', border: 'none', borderRadius: '6px',
                                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#71717a', cursor: 'not-allowed'
                                        }}>
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .leaderboard-row:hover {
                        transform: translateY(-2px);
                        border-color: #3f3f46;
                    }
                `}</style>

            </main>

            <DashboardFooter />
        </div>
    )
}
