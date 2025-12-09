"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface HeroSlide {
    id: string
    title: string
    subtitle: string
    description: string
    image: string
    ctaText: string
    ctaLink: string
    partners?: { name: string; logo?: string }[]
    color: string
}

interface HeroCarouselProps {
    slides: HeroSlide[]
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % slides.length)
    }

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }

    useEffect(() => {
        if (!isAutoPlaying) return
        const interval = setInterval(nextSlide, 5000)
        return () => clearInterval(interval)
    }, [isAutoPlaying, slides.length])

    if (!slides || slides.length === 0) return null

    const slide = slides[current]

    return (
        <div
            className="hero-carousel-frame"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            style={{
                background: '#131313', // Dark frame background
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '8px', // The "gap" between frame and image
                height: '100%', // Match parent/grid height (approx 460px from sidebar)
                minHeight: '340px', // Fallback
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <style jsx>{`
                @keyframes slideUpFade {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slideUpFade 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .hover-trigger:hover .nav-arrow {
                    opacity: 1;
                }
                .content-panel {
                    transform: translateY(110%);
                    opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease;
                }
                .hover-trigger:hover .content-panel {
                    transform: translateY(0);
                    opacity: 1;
                }
                .hero-inner-window {
                    border-radius: 14px;
                    transition: border-radius 0.4s ease;
                }
                .hero-inner-window:hover {
                    border-radius: 14px 14px 0 0;
                    transition-delay: 0.1s;
                }
            `}</style>

            <div
                className="hero-inner-window hover-trigger"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    background: '#0D0E12'
                }}
            >
                {/* Carousel Track for Slide Animation */}
                <div
                    className="carousel-track"
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                        transform: `translateX(-${current * 100}%)`,
                    }}
                >
                    {slides.map((s, index) => (
                        <div
                            key={s.id}
                            style={{
                                position: 'relative',
                                minWidth: '100%', // Each slide takes full width
                                height: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Background Image */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: `url(${s.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                zIndex: 1
                            }} />

                            {/* Gradient Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, #0D0E12 0%, rgba(13,14,18,0.8) 40%, rgba(13,14,18,0) 100%)',
                                zIndex: 2
                            }} />

                            {/* Heavy Bottom Overlay for Text Panel - Slides Up on Hover */}
                            <div
                                className="content-panel"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    height: 'auto', // Auto height to fit content
                                    minHeight: '29%',
                                    background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 20%, #141414 100%)', // Solid/Dark bg
                                    backdropFilter: 'blur(10px)',
                                    borderTop: '1px solid rgba(255,255,255,0.08)',
                                    zIndex: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '1.25rem 2rem 1.5rem 2rem',
                                }}
                            >
                                {/* Row 1: Partner / Tag */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {s.partners && s.partners.length > 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {/* Placeholder Icon if no logo */}
                                            <div style={{ width: '20px', height: '20px', background: '#333', borderRadius: '4px' }}></div>
                                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{s.partners?.[0]?.name ?? 'Partner'}</span>
                                        </div>
                                    ) : (
                                        <div style={{ background: '#CA8A04', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {s.subtitle}
                                        </div>
                                    )}
                                </div>

                                {/* Row 2: Title */}
                                <div
                                    title={s.title}
                                    style={{
                                        fontSize: '1.5rem', // tw-text-2xl
                                        fontWeight: 700,
                                        color: '#fff',
                                        lineHeight: '2rem',
                                        whiteSpace: 'nowrap', // tw-text-nowrap
                                        overflow: 'hidden', // tw-overflow-hidden
                                        textOverflow: 'ellipsis', // tw-text-ellipsis
                                        paddingTop: '0.25rem', // tw-pt-1
                                        margin: 0, // Reset margin to rely on padding/gap
                                    }}
                                >
                                    {s.title}
                                </div>

                                {/* Row 3: Metrics / Badges */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                                    {/* XP Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '99px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                        <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>250 XPs</span>
                                    </div>
                                    {/* Points Badge */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '99px' }}>
                                        {/* Simple icon or just text */}
                                        <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>100 Official Points</span>
                                    </div>

                                    <div style={{ flex: 1 }}></div>

                                    {/* Ending Timer (Right Aligned) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '0.9rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Ending in 22 Days
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows - Fade in on Frame Hover */}
                <button
                    className="nav-arrow"
                    onClick={prevSlide}
                    style={{
                        position: 'absolute',
                        left: '0.5rem', // Slight adjust
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px', // Tall rectangle
                        height: '80px',
                        background: '#1F1F1F', // Solid dark
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        zIndex: 20,
                        border: '1px solid rgba(255,255,255,0.05)',
                        opacity: 0, // Hidden by default
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    className="nav-arrow"
                    onClick={nextSlide}
                    style={{
                        position: 'absolute',
                        right: '0.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px', // Tall rectangle
                        height: '80px',
                        background: '#1F1F1F',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        cursor: 'pointer',
                        zIndex: 20,
                        border: '1px solid rgba(255,255,255,0.05)',
                        opacity: 0, // Hidden by default
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    )
}
