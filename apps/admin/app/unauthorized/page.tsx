"use client"

import { ShieldOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" 
             style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)' }}>
          <ShieldOff size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Access Denied
        </h1>
        <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
          You don&apo;t have permission to access the admin panel. Only administrators can access this area.
        </p>
        <button
          onClick={() => router.push("/sign-in")}
          className="btn btn-primary"
        >
          Return to Sign In
        </button>
      </div>
    </div>
  )
}
