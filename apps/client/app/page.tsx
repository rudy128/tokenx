import { ArrowRight, Users, Trophy, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen theme-transition" style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto" style={{ padding: 'var(--space-20) var(--space-4) var(--space-16)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="text-center max-w-4xl mx-auto" style={{ marginBottom: 'var(--space-20)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div 
            className="inline-block theme-transition" 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-brand)',
              padding: 'var(--space-3) var(--space-6)',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              letterSpacing: 'var(--letter-spacing-wide)',
              marginBottom: 'var(--space-6)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            TokenX Ambassador Platform
          </div>
          <h1 
            style={{
              fontSize: 'clamp(var(--font-size-4xl), 8vw, var(--font-size-6xl))',
              fontFamily: 'var(--font-family-heading)',
              fontWeight: 'var(--font-weight-extrabold)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)'
            }}
          >
            Empower Your{" "}
            <span 
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500), var(--color-primary-400))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Community
            </span>
          </h1>
          <p 
            style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--text-secondary)',
              maxWidth: '48rem',
              margin: '0 auto var(--space-8)',
              lineHeight: 'var(--line-height-relaxed)'
            }}
          >
            Join the ultimate campaign and task management platform for ambassadors. Earn rewards, build communities,
            and grow together.
          </p>
          <div 
            className="flex flex-row justify-center" 
            style={{ 
              gap: 'var(--space-4)', 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'center', 
              width: '100%',
              flexWrap: 'nowrap'
            }}
          >
            <Link href="/auth/signup" className="group inline-flex" style={{ flex: '0 0 auto', alignSelf: 'flex-start' }}>
              <button className="btn btn-primary btn-lg group" style={{ 
                minWidth: '140px',
                height: 'var(--button-height-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                padding: '0 var(--space-8)',
                margin: '0',
                verticalAlign: 'top',
                boxSizing: 'border-box'
              }}>
                Get Started
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </Link>
            <Link href="/auth/signin" className="group inline-flex" style={{ flex: '0 0 auto', alignSelf: 'flex-start' }}>
              <button className="btn btn-secondary btn-lg" style={{ 
                minWidth: '140px',
                height: 'var(--button-height-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                padding: '0 var(--space-8)',
                margin: '0',
                verticalAlign: 'top',
                boxSizing: 'border-box'
              }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
          style={{ 
            gap: 'var(--space-8)', 
            marginBottom: 'var(--space-20)',
            display: 'grid',
            width: '100%',
            justifyItems: 'center'
          }}
        >
          <div className="card theme-transition" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Users 
                className="animate-pulse" 
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  color: 'var(--color-primary-500)',
                  marginBottom: 'var(--space-3)',
                  display: 'block',
                  margin: '0 auto var(--space-3) auto'
                }} 
              />
              <h3 
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                  textAlign: 'center'
                }}
              >
                Campaign Management
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              Create and manage ambassador campaigns with ease. Set tasks, track progress, and reward participants.
            </p>
          </div>

          <div className="card theme-transition" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Zap 
                className="animate-bounce" 
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  color: 'var(--color-primary-500)',
                  marginBottom: 'var(--space-3)',
                  display: 'block',
                  margin: '0 auto var(--space-3) auto'
                }} 
              />
              <h3 
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                  textAlign: 'center'
                }}
              >
                Task Automation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              Automate task verification with AI-powered systems. Reduce manual work and increase efficiency.
            </p>
          </div>

          <div className="card theme-transition" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Trophy 
                className="animate-pulse" 
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  color: 'var(--color-primary-500)',
                  marginBottom: 'var(--space-3)',
                  display: 'block',
                  margin: '0 auto var(--space-3) auto'
                }} 
              />
              <h3 
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                  textAlign: 'center'
                }}
              >
                Reward System
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              Earn XP, tokens, and climb the leaderboard. Multiple reward tiers keep ambassadors motivated.
            </p>
          </div>

          <div className="card theme-transition" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Shield 
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem', 
                  color: 'var(--color-primary-500)',
                  marginBottom: 'var(--space-3)',
                  display: 'block',
                  margin: '0 auto var(--space-3) auto'
                }} 
              />
              <h3 
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                  textAlign: 'center'
                }}
              >
                Secure & Reliable
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
              Built with security in mind. Multi-auth support including MetaMask for Web3 integration.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-xl mx-auto text-center" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="card-elevated theme-transition text-center"
            style={{ 
              padding: 'var(--space-8)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center', 
              width: '100%',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h2 
              style={{
                fontSize: 'var(--font-size-3xl)',
                fontFamily: 'var(--font-family-heading)',
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-3)',
                textAlign: 'center'
              }}
            >
              Ready to Get Started?
            </h2>
            <p 
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-6)',
                lineHeight: 'var(--line-height-relaxed)',
                textAlign: 'center'
              }}
            >
              Join thousands of ambassadors already using our platform to grow their communities.
            </p>
            <Link href="/auth/signup" className="group inline-flex w-full justify-center" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button 
                className="btn btn-primary btn-lg group"
                style={{ width: '100%', maxWidth: '24rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Join Now
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
