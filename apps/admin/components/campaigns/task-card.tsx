"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Trash2, Plus } from "lucide-react"
import SubTaskRow, { SubTask } from "./subtask-row"

export interface CampaignTask {
  id: string
  title: string
  description: string
  type: 'SOCIAL_MEDIA' | 'CONTENT_CREATION' | 'ENGAGEMENT' | 'REFERRAL' | 'OTHER'
  xpReward: number
  isRequired: boolean
  verificationMethod: 'AUTO' | 'MANUAL' | 'LINK_SUBMISSION'
  subTasks: SubTask[]
}

interface TaskCardProps {
  task: CampaignTask
  index: number
  onUpdate: (taskId: string, field: keyof CampaignTask, value: string | number | boolean) => void
  onRemove: (taskId: string) => void
  onAddSubTask: (taskId: string) => void
  onUpdateSubTask: (taskId: string, subTaskIndex: number, field: keyof SubTask, value: string | number) => void
  onRemoveSubTask: (taskId: string, subTaskIndex: number) => void
}

export default function TaskCard({
  task,
  index,
  onUpdate,
  onRemove,
  onAddSubTask,
  onUpdateSubTask,
  onRemoveSubTask
}: TaskCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div 
      className="rounded-lg p-4"
      style={{ 
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)'
      }}
    >
      {/* Task Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Task {index + 1}: {task.title || 'Untitled'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: 'var(--status-error)' }}
          title="Remove task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Task Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Task Title *
              </label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate(task.id, 'title', e.target.value)}
                placeholder="e.g., Follow us on Twitter"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <textarea
                value={task.description}
                onChange={(e) => onUpdate(task.id, 'description', e.target.value)}
                placeholder="Describe what the ambassador needs to do..."
                className="input min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Task Type *
                </label>
                <select
                  value={task.type}
                  onChange={(e) => onUpdate(task.id, 'type', e.target.value)}
                  className="input"
                >
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="CONTENT_CREATION">Content Creation</option>
                  <option value="ENGAGEMENT">Engagement</option>
                  <option value="REFERRAL">Referral</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  XP Reward *
                </label>
                <input
                  type="number"
                  value={task.xpReward || ''}
                  onChange={(e) => onUpdate(task.id, 'xpReward', parseInt(e.target.value) || 0)}
                  placeholder="100"
                  min="0"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Verification Method *
              </label>
              <select
                value={task.verificationMethod}
                onChange={(e) => onUpdate(task.id, 'verificationMethod', e.target.value)}
                className="input"
              >
                <option value="MANUAL">Manual Review</option>
                <option value="LINK_SUBMISSION">Link Submission</option>
                <option value="AUTO">Automatic</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`required-${task.id}`}
                checked={task.isRequired}
                onChange={(e) => onUpdate(task.id, 'isRequired', e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ 
                  accentColor: 'var(--interactive-primary)',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor={`required-${task.id}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                Required Task
              </label>
            </div>
          </div>

          {/* Subtasks Section */}
          <div 
            className="mt-6 pt-6 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm" style={{ color: 'var(--text-secondary)' }}>
                Subtasks (Optional)
              </h4>
              <button
                type="button"
                onClick={() => onAddSubTask(task.id)}
                className="text-sm flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--interactive-primary)' }}
              >
                <Plus size={14} />
                Add Subtask
              </button>
            </div>

            {task.subTasks.length > 0 && (
              <div className="space-y-3">
                {task.subTasks.map((subTask, subIndex) => (
                  <SubTaskRow
                    key={subTask.id}
                    subTask={subTask}
                    index={subIndex}
                    onUpdate={(idx, field, value) => onUpdateSubTask(task.id, idx, field, value)}
                    onRemove={(idx) => onRemoveSubTask(task.id, idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
