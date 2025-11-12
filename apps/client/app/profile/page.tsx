'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [twitterUsername, setTwitterUsername] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setTwitterUsername(data.twitterUsername || '')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Remove @ if user added it
    const cleanUsername = twitterUsername.replace('@', '').trim()
    
    if (!cleanUsername) {
      toast({
        title: 'Error',
        description: 'Please enter a Twitter username',
        variant: 'destructive',
      })
      return
    }

    console.log('💾 Saving Twitter username:', cleanUsername)
    
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterUsername: cleanUsername }),
      })

      console.log('📡 Save response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Save successful:', data)
        
        toast({
          title: 'Success',
          description: 'Twitter username saved successfully',
        })
        setTwitterUsername(cleanUsername)
        setUser({ ...user, twitterUsername: cleanUsername })
      } else {
        const errorData = await response.json()
        console.error('❌ Save failed:', errorData)
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      console.error('❌ Save error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save Twitter username',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Skeleton Header */}
            <div 
              className="h-10 w-64 rounded-lg mb-8 animate-pulse"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            />
            
            <div className="flex flex-col gap-6">
              {/* Account Information Card Skeleton */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div 
                  className="h-8 w-48 rounded-lg mb-6 animate-pulse"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div 
                        className="h-4 w-20 rounded animate-pulse"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      />
                      <div 
                        className="h-4 w-32 rounded animate-pulse"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Twitter/X Settings Card Skeleton */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div 
                  className="h-8 w-56 rounded-lg mb-6 animate-pulse"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />
                <div>
                  <div 
                    className="h-4 w-32 rounded mb-2 animate-pulse"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  />
                  <div 
                    className="h-12 w-full rounded-lg mb-1 animate-pulse"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  />
                  <div 
                    className="h-3 w-64 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  />
                </div>
                <div 
                  className="h-12 w-full rounded-lg mt-6 animate-pulse"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 
          className="text-4xl font-bold mb-8" 
          style={{ color: 'var(--text-primary)' }}
        >
          Profile Settings
        </h1>
        
        <div className="flex flex-col gap-6">
            {/* Account Information Card */}
            <div 
              className="rounded-2xl p-6 transition-shadow"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h2 
                className="text-2xl font-semibold mb-6" 
                style={{ color: 'var(--text-primary)' }}
              >
                Account Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    Email
                  </span>
                  <span className="text-sm font-normal" style={{ color: 'var(--text-primary)' }}>
                    {user?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    Name
                  </span>
                  <span className="text-sm font-normal" style={{ color: 'var(--text-primary)' }}>
                    {user?.name || 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                    XP Points
                  </span>
                  <span 
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: 'var(--color-success-100)',
                      color: 'var(--color-success-700)',
                    }}
                  >
                    {user?.xp || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Twitter/X Settings Card */}
            <div 
              className="rounded-2xl p-6 transition-shadow"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h2 
                className="text-2xl font-semibold mb-6" 
                style={{ color: 'var(--text-primary)' }}
              >
                Twitter/X Settings
              </h2>
              <form onSubmit={handleSubmit} className="space-y-0">
                <div>
                  <label 
                    htmlFor="twitterUsername" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Twitter Username
                  </label>
                  <input
                    type="text"
                    id="twitterUsername"
                    value={twitterUsername}
                    onChange={(e) => setTwitterUsername(e.target.value)}
                    placeholder="username"
                    className="w-full px-4 py-3 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-transparent border border-gray-300 dark:border-gray-700"
                    style={{
                      color: 'var(--text-primary)',
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your Twitter/X username without the @ symbol
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 w-full px-6 py-3 rounded-lg font-medium transition-all bg-cyan-500 hover:bg-cyan-600 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Twitter Username'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    )
  }
