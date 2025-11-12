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
      className={`!px-4 !py-1.5 text-xs font-semibold ${colorClass} ${className}`}
      style={{ width: 'auto', minWidth: 'fit-content', overflow: 'visible' }}
    >
      {label}
    </Badge>
  )
}
