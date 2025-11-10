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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Email:</span>
                <span className="text-white ml-2">{user?.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Name:</span>
                <span className="text-white ml-2">{user?.name || 'Not set'}</span>
              </div>
              <div>
                <span className="text-gray-400">XP:</span>
                <span className="text-white ml-2">{user?.xp || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Twitter/X Settings</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="twitterUsername" className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter Username (without @)
                </label>
                <input
                  type="text"
                  id="twitterUsername"
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="username"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Enter your Twitter/X username without the @ symbol
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? 'Saving...' : 'Save Twitter Username'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
