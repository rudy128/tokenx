"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface HorizontalScrollProps {
    children: React.ReactNode
    title: string
}

export function HorizontalScroll({ children, title }: HorizontalScrollProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef
            const scrollAmount = 400
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            }
        }
    }

    return (
        <div className="section-container" style={{ marginBottom: '3rem', position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingRight: '1rem'
            }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-family-heading)',
                    color: 'var(--text-primary)'
                }}>
                    {title}
                </h2>
            </div>

            <div className="scroll-wrapper" style={{ position: 'relative' }}>
                {/* Left Arrow */}
                <button
                    onClick={() => scroll('left')}
                    className="nav-arrow left"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="scroll-container"
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        paddingBottom: '1rem',
                        paddingLeft: '2px', // Prevent cutoff shadows
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {children}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll('right')}
                    className="nav-arrow right"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <style jsx>{`
        .scroll-container::-webkit-scrollbar {
          display: none; 
        }
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 60px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
        }
        .section-container:hover .nav-arrow {
          opacity: 1;
          visibility: visible;
        }
        .nav-arrow:hover {
          background: rgba(15, 23, 42, 0.9);
          border-color: var(--border-default);
        }
        .nav-arrow.left {
          left: -20px;
        }
        .nav-arrow.right {
          right: -20px;
        }
        @media (max-width: 768px) {
          .nav-arrow {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}
