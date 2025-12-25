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
            className="hero-carousel-container"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            style={{
                position: 'relative',
                height: '340px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#0D0E12',
            }}
        >
            {/* Keyframes for progress bar animation */}
            <style jsx>{`
                @keyframes progressFill {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>

            {slides.map((s, index) => (
                <div
                    key={s.id}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === current ? 1 : 0,
                        transition: 'opacity 0.6s ease-in-out',
                        pointerEvents: index === current ? 'auto' : 'none',
                    }}
                >
                    {/* Background Image Layer */}
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
                        background: 'linear-gradient(90deg, #0D0E12 0%, rgba(13,14,18,0.85) 45%, rgba(13,14,18,0) 100%)', // Slightly stronger overlay
                        zIndex: 2
                    }} />

                    {/* Content Layer */}
                    <div style={{
                        position: 'relative',
                        zIndex: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: '0 3.5rem', // Adjusted padding
                        maxWidth: '540px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            {s.partners?.map((p, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>{p.name}</span>
                                    {i < (s.partners?.length || 0) - 1 && (
                                        <span style={{ color: '#666' }}>×</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                display: 'inline-flex', // better alignment
                                alignSelf: 'flex-start',
                                background: '#fff',
                                color: '#000',
                                padding: '4px 14px',
                                borderRadius: '99px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                marginBottom: '1.25rem',
                                transform: 'rotate(-2deg)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        >
                            {s.subtitle}
                        </div>

                        <h1 style={{
                            fontSize: '2.75rem', // Slightly toned down
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '0.75rem',
                            color: '#fff',
                            textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                            letterSpacing: '-0.02em'
                        }}>
                            {s.title}
                        </h1>

                        <p style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: '#A855F7',
                            marginBottom: '2.5rem',
                            letterSpacing: '-0.01em'
                        }}>
                            {s.description}
                        </p>

                        {/* Progress Bar Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingBottom: '2.5rem' }}>
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    style={{
                                        position: 'relative',
                                        width: '3rem',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        padding: 0
                                    }}
                                >
                                    {/* Active Progress Fill */}
                                    {i === current && (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            background: '#fff',
                                            animation: isAutoPlaying ? 'progressFill 5s linear forwards' : 'none',
                                            transformOrigin: 'left'
                                        }} />
                                    )}
                                    {/* Completed Slides Fill */}
                                    {i < current && (
                                        <div style={{ width: '100%', height: '100%', background: '#fff' }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows - Always Visible */}
            <button
                onClick={prevSlide}
                style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '44px',
                    height: '84px',
                    background: 'rgba(20, 20, 20, 0.45)', // Slightly darker
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s'
                }}
            >
                <ChevronLeft size={28} strokeWidth={1.5} />
            </button>

            <button
                onClick={nextSlide}
                style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '44px',
                    height: '84px',
                    background: 'rgba(20, 20, 20, 0.45)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                    zIndex: 10,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s'
                }}
            >
                <ChevronRight size={28} strokeWidth={1.5} />
            </button>
        </div>
    )
}
