import React from 'react'
import { Badge } from '@/components/ui/badge'
import { getTaskTypeConfig, type TaskType } from '@/lib/task-types'

interface TaskTypeBadgeProps {
  taskType: TaskType | null | undefined
}

export function TaskTypeBadge({ taskType }: TaskTypeBadgeProps) {
  const config = getTaskTypeConfig(taskType)
  
  return (
    <Badge variant="secondary">
      {config.label}
    </Badge>
  )
}