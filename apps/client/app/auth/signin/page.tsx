"use client"

import { signIn, getProviders, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useSearchParams, useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [providers, setProviders] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState("")
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  const error = localError || urlError

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Already authenticated, redirecting to dashboard...")
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders()
      setProviders(response)
    }
    setUpProviders()
  }, [])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError("")

    try {
      console.log("Attempting sign in...")
      // Use redirect: false to handle redirect manually
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      console.log("Sign in result:", result)
      
      if (result?.error) {
        console.error("Sign in error:", result.error)
        setLocalError("CredentialsSignin")
        setIsLoading(false)
      } else if (result?.ok) {
        // Wait a moment for the session to be established
        console.log("Login successful, waiting for session...")
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Force a session update
        window.location.href = "/dashboard"
      } else {
        setLocalError("CredentialsSignin")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setLocalError("CredentialsSignin")
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
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)' }}>
            Sign in to your TokenX Ambassador account
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
                {error === "CredentialsSignin"
                  ? "Invalid email or password"
                  : error === "AccountNotFound"
                  ? "Account not found. Please contact an administrator to create your account."
                  : error === "DatabaseError"
                  ? "Database error. Please try again later."
                  : "An error occurred. Please try again."}
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
            onSubmit={handleCredentialsSignIn} 
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div 
            className="text-center"
            style={{ fontSize: 'var(--font-size-sm)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
            <a 
              href="/auth/signup" 
              style={{ 
                color: 'var(--text-link)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-link-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-link)'}
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}