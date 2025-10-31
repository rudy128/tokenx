"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)

    // Report error to monitoring service
    if (typeof window !== "undefined") {
      // This would typically send to an error reporting service
      console.error("Error reported:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>We encountered an unexpected error. Please try refreshing the page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && process.env.NODE_ENV === "development" && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground">{error.message}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error("Error handled:", error, errorInfo)

    // Report to error service
    if (typeof window !== "undefined") {
      console.error("Error reported via hook:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }
}
