'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ExternalLink, Upload, X, Check, AlertTriangle, ArrowRight } from 'lucide-react'

// Custom Alert Dialog Component
function TwitterHandleAlert({ onClose, onGoToProfile }: { onClose: () => void; onGoToProfile: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1A1F2E] border border-purple-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Twitter Handle Required</h3>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300 leading-relaxed">
            You need to add your <span className="text-purple-400 font-semibold">Twitter/X username</span> to your profile before you can submit tasks.
          </p>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <p className="text-sm text-purple-300">
              💡 This is required for task verification and reward distribution.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-[#15192A] border-t border-purple-500/20 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onGoToProfile}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all font-medium inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          >
            Go to Profile
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}


// Helper function to get platform-specific logo and color
function getPlatformLogo(url: string): { icon: string; color: string } {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    
    // Social Media Platforms
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return {
        icon: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
        color: 'from-blue-400 to-blue-600'
      }
    }
    if (hostname.includes('instagram.com')) {
      return {
        icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
        color: 'from-pink-400 to-purple-600'
      }
    }
    if (hostname.includes('youtube.com')) {
      return {
        icon: 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png',
        color: 'from-red-500 to-red-600'
      }
    }
    if (hostname.includes('tiktok.com')) {
      return {
        icon: 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png',
        color: 'from-black to-gray-800'
      }
    }
    if (hostname.includes('linkedin.com')) {
      return {
        icon: 'https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
        color: 'from-blue-600 to-blue-700'
      }
    }
    if (hostname.includes('facebook.com')) {
      return {
        icon: 'https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg',
        color: 'from-blue-500 to-blue-700'
      }
    }
    if (hostname.includes('discord.com')) {
      return {
        icon: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico',
        color: 'from-indigo-500 to-indigo-600'
      }
    }
    if (hostname.includes('telegram.org') || hostname.includes('t.me')) {
      return {
        icon: 'https://telegram.org/img/t_logo.png',
        color: 'from-blue-400 to-blue-500'
      }
    }
    if (hostname.includes('reddit.com')) {
      return {
        icon: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-96x96.png',
        color: 'from-orange-500 to-orange-600'
      }
    }
    if (hostname.includes('medium.com')) {
      return {
        icon: 'https://miro.medium.com/max/195/1*emiGsBgJu2KHWyjluhKXQw.png',
        color: 'from-gray-800 to-black'
      }
    }
    
    // Default fallback
    return {
      icon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      color: 'from-purple-500 to-purple-600'
    }
  } catch {
    return {
      icon: '',
      color: 'from-gray-700 to-gray-800'
    }
  }
}

interface SubTask {
  id: string
  title: string
  description: string | null
  link: string | null
  xpReward: number
  order: number
  isCompleted: boolean
  isUploadProof?: boolean
}

interface Task {
  id: string
  title: string
  description: string
  xpReward: number
  status: string
  campaign?: {
    id: string
    name: string
    slug: string
    status: string
  }
  subTasks: SubTask[]
  _count?: {
    submissions: number
  }
}

interface Props {
  task: Task
  userId: string
}

export default function TaskDetailView({ task, userId }: Props) {
  // 🔍 DEBUG: Log task data on component mount
  console.log('🎯 TaskDetailView - Received task:', {
    taskId: task.id,
    taskTitle: task.title,
    subtasksCount: task.subTasks?.length || 0,
    subtasks: task.subTasks?.map(st => ({
      id: st.id,
      title: st.title,
      isUploadProof: st.isUploadProof,
      hasIsUploadProofField: 'isUploadProof' in st
    }))
  })

  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subTasks || [])
  const [loading, setLoading] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({}) // Track uploaded files
  const [uploadPreviews, setUploadPreviews] = useState<Record<string, string>>({}) // Track preview URLs
  const [showTwitterAlert, setShowTwitterAlert] = useState(false) // Twitter handle alert dialog

  // Calculate total XP from all subtasks
  const totalXP = subtasks.reduce((sum, st) => sum + (st.xpReward || 0), 0)
  const participantCount = task._count?.submissions || 0
  const displayParticipants = participantCount > 5000 ? '5K+' : `${participantCount}+`

  // Handle file selection for upload proof subtask
  const handleFileSelect = (subtaskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Store file
    setUploadedFiles(prev => ({
      ...prev,
      [subtaskId]: file
    }))

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setUploadPreviews(prev => ({
      ...prev,
      [subtaskId]: previewUrl
    }))
  }

  // Remove uploaded file
  const removeUploadedFile = (subtaskId: string) => {
    // Revoke preview URL to free memory
    if (uploadPreviews[subtaskId]) {
      URL.revokeObjectURL(uploadPreviews[subtaskId])
    }

    setUploadedFiles(prev => {
      const newFiles = { ...prev }
      delete newFiles[subtaskId]
      return newFiles
    })

    setUploadPreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[subtaskId]
      return newPreviews
    })
  }

  // Handle individual subtask submission
  const handleSubtaskSubmission = async (subtask: SubTask) => {
    try {
      setLoading(subtask.id)

      // ✅ Check if Twitter username is set before submission
      console.log('🔍 Checking Twitter username...')
      const profileResponse = await fetch('/api/profile')
      
      if (!profileResponse.ok) {
        console.error('❌ Failed to fetch profile')
        alert('Failed to verify your profile. Please try again.')
        return
      }
      
      const profile = await profileResponse.json()
      console.log('👤 Profile data:', profile)
      
      if (!profile.twitterUsername) {
        console.log('⚠️ No Twitter username found, showing alert')
        // Show custom alert dialog
        setShowTwitterAlert(true)
        return
      }
      
      console.log('✅ Twitter username exists:', profile.twitterUsername)

      // Check if this subtask requires proof upload and file is missing
      if (subtask.isUploadProof && !uploadedFiles[subtask.id]) {
        alert('Please upload proof before submitting this subtask')
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('taskId', task.id)
      formData.append('userId', userId)
      
      // ✅ ALWAYS include subTaskId for individual subtask submissions
      formData.append('subTaskId', subtask.id)
      console.log('🔵 Frontend - Submitting subtask:', subtask.id, subtask.title)

      // Add uploaded file if exists
      if (uploadedFiles[subtask.id]) {
        formData.append('proofFile', uploadedFiles[subtask.id])
        console.log('📎 Frontend - Including uploaded file')
      }

      // 🔍 DEBUG: Log what we're sending
      console.log('📤 Frontend - Sending FormData:')
      console.log('   Task ID:', task.id)
      console.log('   Subtask ID:', subtask.id)
      console.log('   User ID:', userId)
      console.log('   Has File:', !!uploadedFiles[subtask.id])

      // Submit to API
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit subtask')
      }

      alert(`Subtask "${subtask.title}" submitted successfully! XP will be credited after review.`)
      
      // Mark subtask as completed in UI
      setSubtasks(prev => prev.map(st => 
        st.id === subtask.id ? { ...st, isCompleted: true } : st
      ))

    } catch (error: any) {
      console.error('Subtask submission error:', error)
      alert(error.message || 'Failed to submit subtask')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* Twitter Handle Alert Dialog */}
      {showTwitterAlert && (
        <TwitterHandleAlert
          onClose={() => setShowTwitterAlert(false)}
          onGoToProfile={() => {
            window.location.href = '/profile'
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Hero Section with Gradient Background */}
        <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 md:p-12">
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {task.title}
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl">
              {task.description}
            </p>
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl px-6 py-4 mb-8 border border-gray-800/50">
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium text-sm">
              {task.status === 'ACTIVE' ? 'Active' : task.status}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-700"></div>

          {/* XP Reward */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white font-semibold">{task.xpReward || totalXP} XP</span>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-6 bg-gray-700"></div>

          {/* Participants */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-gray-900"></div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-gray-900"></div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-gray-900"></div>
            </div>
            <span className="text-gray-300 font-medium text-sm">{displayParticipants} Participants</span>
          </div>
        </div>

        {/* Sub-tasks Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Sub-tasks</h2>
            <div className="text-sm text-gray-400">
              Complete all tasks to unlock rewards
            </div>
          </div>
          
          {subtasks.length > 0 ? (
            <div className="grid gap-8">
              {subtasks.map((subtask, index) => {
                const platformInfo = subtask.link ? getPlatformLogo(subtask.link) : null
                const isUploadProof = subtask.isUploadProof || subtask.title.toLowerCase().includes('upload proof')
                const hasUploadedFile = uploadedFiles[subtask.id]
                
                return (
                  <div
                    key={subtask.id}
                    className="group relative bg-gradient-to-r from-gray-900 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 overflow-hidden mb-6 last:mb-0"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6">
                      <div className="flex items-center gap-6">
                        
                        {/* Left: Icon */}
                        <div className="flex-shrink-0">
                          {isUploadProof ? (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 p-2 flex items-center justify-center shadow-lg">
                              {hasUploadedFile ? (
                                <Check className="w-8 h-8 text-white" />
                              ) : (
                                <Upload className="w-8 h-8 text-white" />
                              )}
                            </div>
                          ) : platformInfo && platformInfo.icon ? (
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${platformInfo.color} p-2 flex items-center justify-center shadow-lg`}>
                              <img
                                src={platformInfo.icon}
                                alt="Platform"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement
                                  if (parent) {
                                    parent.innerHTML = `
                                      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                      </svg>
                                    `
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Middle: Task Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Task {index + 1}
                            </span>
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 transition-all duration-300">
                            {subtask.title}
                          </h3>
                          
                          {/* Link for non-upload subtasks */}
                          {!isUploadProof && subtask.link && (
                            <a
                              href={subtask.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="truncate max-w-xs">
                                {new URL(subtask.link).hostname.replace('www.', '')}
                              </span>
                            </a>
                          )}

                          {/* File Upload Section for Upload Proof */}
                          {isUploadProof && (
                            <div className="mt-3">
                              {hasUploadedFile ? (
                                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                  <img
                                    src={uploadPreviews[subtask.id]}
                                    alt="Uploaded proof"
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm text-green-400 font-medium">
                                      {uploadedFiles[subtask.id].name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(uploadedFiles[subtask.id].size / 1024).toFixed(1)} KB
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeUploadedFile(subtask.id)}
                                    className="text-red-400 hover:text-red-300 p-2"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/50 rounded-lg p-3 cursor-pointer transition-colors">
                                  <Upload className="w-5 h-5 text-purple-400" />
                                  <span className="text-sm text-purple-300">
                                    Click to upload image proof
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(subtask.id, e)}
                                    className="hidden"
                                  />
                                </label>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Right: XP Badge and Action */}
                        <div className="flex-shrink-0 flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                              Reward
                            </div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                              {subtask.xpReward}
                            </div>
                            <div className="text-xs text-gray-400 font-semibold">
                              XP
                            </div>
                          </div>
                          
                          {/* Submit Button for Each Subtask */}
                          {subtask.isCompleted ? (
                            <div className="px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-400" />
                              <span className="text-sm font-semibold text-green-400">Submitted</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSubtaskSubmission(subtask)}
                              disabled={loading === subtask.id}
                              className="px-6 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                              {loading === subtask.id ? (
                                <>
                                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span className="text-sm font-semibold text-white">Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-5 h-5 text-white" />
                                  <span className="text-sm font-semibold text-white">Submit</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-900/50 rounded-2xl p-16 text-center border border-gray-800/50">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No subtasks available</h3>
              <p className="text-gray-500">The admin hasn't added any subtasks to this task yet</p>
            </div>
          )}
        </div>

        {/* Info message */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-blue-300 text-center">
            💡 Submit each subtask individually to earn XP rewards after admin review
          </p>
        </div>

      </div>
    </div>
  )
}
