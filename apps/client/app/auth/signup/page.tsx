"use client"

import { signIn, getProviders } from "next-auth/react"
import { useState, useEffect } from "react"

export default function SignUpPage() {
  const [providers, setProviders] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders()
      setProviders(response)
    }
    setUpProviders()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Create user account
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        // Sign in the user after successful registration
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/dashboard",
        })
      } else {
        const data = await response.json()
        setError(data.message || "Registration failed")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: "/dashboard" })
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center theme-transition"
      style={{ 
        backgroundColor: 'var(--bg-primary)', 
        padding: 'var(--space-4)' 
      }}
    >
      <div 
        className="w-full theme-transition"
        style={{ 
          maxWidth: '28rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div className="text-center" style={{ marginBottom: 'var(--space-8)' }}>
          <h1 
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontFamily: 'var(--font-family-heading)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)'
            }}
          >
            Create account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
            Join the TokenX Ambassador Platform
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && (
            <div 
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-base)',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                marginBottom: 'var(--space-4)'
              }}
            >
              <p 
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--status-error-text)'
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* Social Login Providers */}
          {providers && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {Object.values(providers).map((provider: any) => {
                if (provider.id === "credentials") return null

                return (
                  <button
                    key={provider.id}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => handleProviderSignIn(provider.id)}
                  >
                    Continue with {provider.name}
                  </button>
                )
              })}
            </div>
          )}

          {providers && Object.keys(providers).length > 1 && (
            <div 
              className="relative"
              style={{ margin: 'var(--space-6) 0' }}
            >
              <div 
                style={{
                  height: '1px',
                  backgroundColor: 'var(--border-default)'
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center"
              >
                <span 
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0 var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Or continue with email
                </span>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form 
            onSubmit={handleSignUp} 
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            <div>
              <label 
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label 
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label 
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div 
            className="text-center"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
            <a 
              href="/auth/signin" 
              style={{ 
                color: 'var(--text-link)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-link-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-link)'}
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
