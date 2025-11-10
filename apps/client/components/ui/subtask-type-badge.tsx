import React from 'react'
import { Badge } from './badge'
import { getSubTaskTypeLabel, getSubTaskTypeBadgeColor, type SubTaskType } from '@/lib/subtask-types'

interface SubTaskTypeBadgeProps {
  type: SubTaskType | string
  className?: string
}

export function SubTaskTypeBadge({ type, className = '' }: SubTaskTypeBadgeProps) {
  const label = getSubTaskTypeLabel(type)
  const colorClass = getSubTaskTypeBadgeColor(type)

  return (
    <Badge 
      className={`rounded-md px-2 py-0.5 text-xs font-medium border ${colorClass} ${className}`}
    >
      {label}
    </Badge>
  )
}
