"use client"

import { X } from "lucide-react"

export interface SubTask {
  id: string
  title: string
  link: string
  xpReward: number
  order: number
  isUploadProof?: boolean
}

interface SubTaskRowProps {
  subTask: SubTask
  index: number
  onUpdate: (index: number, field: keyof SubTask, value: string | number) => void
  onRemove: (index: number) => void
}

export default function SubTaskRow({ subTask, index, onUpdate, onRemove }: SubTaskRowProps) {
  return (
    <div 
      className="flex items-start gap-3 p-3 rounded border"
      style={{ 
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)'
      }}
    >
      <div 
        className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium"
        style={{ 
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-secondary)'
        }}
      >
        {index + 1}
      </div>

      <div className="flex-1 space-y-3">
        {/* Title Input */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            Subtask Title *
          </label>
          <input
            type="text"
            placeholder="e.g., Follow us on Twitter"
            value={subTask.title}
            onChange={(e) => onUpdate(index, 'title', e.target.value)}
            className="input text-sm"
            style={{ minHeight: '36px' }}
            required
          />
        </div>

        {/* Link Input */}
        {!subTask.isUploadProof && (
          <div>
            <label 
              className="block text-sm font-medium mb-1 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <svg className="h-4 w-4" style={{ color: 'var(--interactive-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Link URL
            </label>
            <input
              type="url"
              placeholder="https://twitter.com/your_handle"
              value={subTask.link || ''}
              onChange={(e) => onUpdate(index, 'link', e.target.value)}
              className="input text-sm"
              style={{ minHeight: '36px' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Add a reference link (e.g., social media profile, content URL)
            </p>
          </div>
        )}

        {/* XP Reward Input */}
        <div>
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            XP Reward
          </label>
          <input
            type="number"
            placeholder="10"
            value={subTask.xpReward || ''}
            onChange={(e) => onUpdate(index, 'xpReward', parseInt(e.target.value) || 0)}
            className="input text-sm"
            min="0"
            style={{ minHeight: '36px' }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
        style={{ color: 'var(--status-error)' }}
        title="Remove subtask"
      >
        <X size={16} />
      </button>
    </div>
  )
}
