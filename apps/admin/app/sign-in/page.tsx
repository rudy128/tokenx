"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

function SignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("admin-credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password, or you don't have admin access")
        } else {
          setError("An error occurred. Please try again.")
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Small delay to ensure session is set
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.href = callbackUrl
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page-container">
      {/* Theme Toggle */}
      <div className="auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="auth-content-wrapper">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-container">
            <Shield size={32} />
          </div>
          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Sign In Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Error Message */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="admin@example.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input auth-password-input"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="auth-disclaimer">
          This is a restricted area. Only administrators can access this portal.
        </p>
      </div>
    </div>
  )
}

export default function AdminSignIn() {
  return (
    <Suspense fallback={
      <div className="auth-page-container">
        <div className="auth-content-wrapper">
          <div className="auth-header">
            <div className="auth-icon-container">
              <Shield size={32} />
            </div>
            <h1 className="auth-title">Admin Portal</h1>
            <p className="auth-subtitle">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
