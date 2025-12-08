"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { DashboardProfileMenu } from "@/components/dashboard/dashboard-profile-menu"
import { Search, Bell, Flame } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/ecosystems", label: "Ecosystems" },
  { href: "/explore", label: "Explore" },
  { href: "/products", label: "Products" },
  { href: "/quests/launch", label: "Launch Quests" },
]

function AnimatedMintButton() {
  const [showMint, setShowMint] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowMint(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <button
      className="sm:tw-flex tw-hidden"
      style={{
        height: '42.5px',
        minWidth: '176px', // "tw-min-w-44"
        maxWidth: '176px',
        border: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column', // Stack vertically
        alignItems: 'center',
        justifyContent: 'flex-start', // Start from top
        padding: '0 1rem',
        cursor: 'pointer'
      }}
    >
      <img
        src="https://static.highongrowth.xyz/b2c/poh-discovery-bg.gif"
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          filter: 'grayscale(100%)'
        }}
        alt="bg"
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '12px',
          zIndex: 10,
          opacity: 0.7,
          bottom: '-14px',
          backgroundColor: '#86EC46',
          filter: 'blur(15px)'
        }}
      />

      {/* Slider Content Container */}
      <div
        style={{
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          transition: 'transform 0.5s ease-in-out',
          // Stack: [PoH, Mint].
          // If showMint (True), we want to show Mint (bottom), so slide UP (-42.5px).
          // If !showMint (False), we want to show PoH (top), so slide DOWN (0).
          transform: showMint ? 'translateY(-42.5px)' : 'translateY(0)'
        }}
      >
        {/* Item 1: Proof of Humanity (Top) */}
        <div style={{
          height: '42.5px',
          flex: '0 0 42.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: !showMint ? 1 : 0.5,
          transition: 'opacity 0.3s'
        }}>
          {/* PoH Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'white' }}>
            <path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3A5.37 5.37 0 0 0 2 8.25c0 2.8.656 3.054 1 4.55a5.77 5.77 0 0 1 .029 2.758L2 20"></path>
            <path d="M19.8 17.8a7.5 7.5 0 0 0 .003-10.603"></path>
            <path d="M17 15a3.5 3.5 0 0 0-.025-4.975"></path>
          </svg>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>Proof of Humanity</span>
        </div>

        {/* Item 2: Mint Now (Bottom) */}
        <div style={{
          height: '42.5px',
          flex: '0 0 42.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: showMint ? 1 : 0.5, // Subtle fade for non-active
          transition: 'opacity 0.3s'
        }}>
          <img
            src="https://static.highongrowth.xyz/b2c/persona-nft.png"
            width="18"
            height="28"
            alt="human"
            style={{
              height: 'auto',
              maxHeight: '28px',
              backgroundColor: 'transparent',
              maxWidth: '100%',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
          />
          <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Mint Now</span>
        </div>
      </div>
    </button>
  )
}

export function NavBar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [blurActive, setBlurActive] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 0
      setBlurActive(scrolled)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActivePath = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className={`navbar-top-spacer${blurActive ? " blur-active" : ""}`} />

      <nav className={`tokenx-navbar${blurActive ? " blur-active" : ""}`}>
        <div
          className="navbar-content"
          style={{
            width: '100%',
            maxWidth: '1280px', // Matches typical page content max-width
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Ensures Left and Right are pushed to edges
            height: '4rem',
            padding: '0 2rem', // Standard padding
          }}
        >
          {/* LEFT SIDE GROUP */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* 1. Logo Container */}
            <Link
              href="/"
              aria-current="page"
              aria-label="home"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <div className="_logo_container_1uurh_1">
                <img
                  src="https://static.highongrowth.xyz/b2c/intract_logo_only.png"
                  className="_logo_image_1uurh_15"
                  alt="intract logo"
                  style={{ height: '32px', width: 'auto' }}
                />
              </div>
            </Link>

            {/* 2. Nav Tabs Container */}
            <div
              className="_nav_left_side_container_18jd6_119 mobile-hidden"
              style={{ marginLeft: '24px', display: 'flex', alignItems: 'center', height: '100%' }}
            >
              <nav id="nav_container" role="navigation" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '24px' }}>
                {navItems.map((item) => {
                  const isActive = isActivePath(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{ textDecoration: 'none' }}
                    >
                      <div
                        className={`_nav_link_18jd6_26 ${isActive ? '_active_18jd6_55' : ''}`}
                        style={{
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          fontSize: '0.95rem',
                          fontWeight: isActive ? 500 : 400,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          height: '4rem',
                          transition: 'color 0.2s'
                        }}
                      >
                        {item.label}
                        {isActive && (
                          <div className="_active_strip_18jd6_55" style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            background: '#fff',
                            borderRadius: '2px 2px 0 0'
                          }} />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* 3. RIGHT SIDE GROUP */}
          <div
            className="navbar-end-holder"
            style={{
              zIndex: 10000,
              // Removed margin-left: 2rem so it just stays at the end
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              justifyContent: 'flex-end',
              position: 'relative'
            }}
          >
            {/* Search Bar */}
            <div
              className="_searchbar_container_1bf1z_1 mobile-hidden"
              style={{
                width: '160px',
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.07)',
                borderRadius: '99px',
                padding: '0 8px 0 12px', // Reduce padding slightly to save space
                height: '40px',
                border: '1px solid transparent'
              }}
            >
              <Search size={14} color="rgba(255,255,255,0.5)" style={{ marginRight: '6px', minWidth: '14px' }} />
              <input
                type="text"
                placeholder="Search"
                style={{
                  flex: 1, // Allow input to take available space
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 400
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                {/* CMD Key */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                }}>
                  <img src="https://static.highongrowth.xyz/b2c/Command.svg" alt="cmd" style={{ width: '10px', height: '10px', opacity: 0.8 }} />
                </div>
                {/* K Key */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: 500
                }}>
                  K
                </div>
              </div>
            </div>

            {/* Proof of Humanity / Mint Now Button */}
            <div className="_nav_link_18jd6_26 mobile-hidden" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <AnimatedMintButton />
            </div>

            {/* Auth Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="nav-menu-button-holder" style={{ marginLeft: '0.5rem' }}>
                {session?.user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn" style={{
                      backgroundColor: 'rgba(234, 88, 12, 0.1)',
                      color: '#ea580c',
                      borderRadius: '99px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      height: '40px',
                      padding: '0 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: '1px solid rgba(234, 88, 12, 0.2)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}>
                      <Flame size={16} fill="#ea580c" />
                      <span className="hidden lg:inline">Streak!</span>
                    </button>

                    <button style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      cursor: 'pointer'
                    }}>
                      <Bell size={18} />
                    </button>

                    <DashboardProfileMenu
                      name={session.user.name || null}
                      email={session.user.email || 'Guest'}
                      image={session.user.image || null}
                      tier="BRONZE TIER"
                    />
                  </div>
                ) : (
                  <Link href="/auth/signin">
                    <div className="_primary_button_container_1vmwd_1 _sign_in_button_18jd6_147">
                      <div
                        className="_primary_button_1vmwd_1"
                        style={{
                          background: '#fff',
                          color: '#000',
                          fontWeight: 600,
                          height: '40px',
                          borderRadius: '8px',
                          padding: '0 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          fontSize: '0.95rem',
                          cursor: 'pointer'
                        }}
                      >
                        Sign In
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div
              className="sm:tw-hidden mobile-menu-toggle"
              style={{
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px',
                padding: '0.5rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                height: '40px',
                width: '40px'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip" style={{ color: 'white', opacity: 0.8 }}>
                <circle cx="12" cy="5" r="1"></circle><circle cx="19" cy="5" r="1"></circle><circle cx="5" cy="5" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle><circle cx="19" cy="19" r="1"></circle><circle cx="5" cy="19" r="1"></circle>
              </svg>
            </div>

          </div>
        </div>
      </nav>

      <style jsx global>{`
        .navbar-top-spacer { height: 4.5rem; display: block; }
        
        .tokenx-navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 100;
          background: rgba(9, 9, 11, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08); 
          transition: background 0.3s ease;
        }

        .nav-link-item:hover {
          color: #fff !important;
        }

        @media (max-width: 1024px) {
           .tokenx-navbar .navbar-content {
               padding: 0 1rem;
           }
           .mobile-hidden {
               display: none !important;
           }
           .mobile-menu-toggle {
               display: flex !important;
           }
        }
      `}</style>
    </>
  )
}

export default NavBar