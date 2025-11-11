export type TaskType = 'LIKE' | 'RT' | 'QT' | 'CMNT' | 'OT' | 'VID' | 'BLOG' | 'TXT' | 'INV' | 'SURVEY' | 'AMA' | 'SPACE' | 'MUP' | 'GENERAL'

// SubTask type from Prisma schema
export type SubTaskType = 'X_LIKE' | 'X_COMMENT' | 'X_SHARE' | 'X_SPACE_HOST' | 'X_QUOTE' | 'X_RETWEET' | 'X_TWEET' | 'X_CUSTOM'

export interface TaskTypeConfig {
  id: TaskType
  label: string
}

export const TASK_TYPE_CONFIGS: Record<TaskType, TaskTypeConfig> = {
  LIKE: { id: 'LIKE', label: 'Like' },
  RT: { id: 'RT', label: 'Retweet' },
  QT: { id: 'QT', label: 'Quote' },
  CMNT: { id: 'CMNT', label: 'Comment' },
  OT: { id: 'OT', label: 'Thread' },
  VID: { id: 'VID', label: 'Video' },
  BLOG: { id: 'BLOG', label: 'Blog' },
  TXT: { id: 'TXT', label: 'Text' },
  INV: { id: 'INV', label: 'Invite' },
  SURVEY: { id: 'SURVEY', label: 'Survey' },
  AMA: { id: 'AMA', label: 'AMA' },
  SPACE: { id: 'SPACE', label: 'Space' },
  MUP: { id: 'MUP', label: 'Meetup' },
  GENERAL: { id: 'GENERAL', label: 'Task' }
}

/**
 * Maps SubTaskType enum values to TaskType for Twitter verification
 * @param subTaskType - The subtask type from Prisma schema (X_LIKE, X_RETWEET, etc.)
 * @returns Corresponding TaskType for Twitter API endpoints
 */
export function mapSubTaskTypeToTaskType(subTaskType?: string | null): TaskType {
  if (!subTaskType) return 'GENERAL'
  
  const mapping: Record<string, TaskType> = {
    'X_LIKE': 'LIKE',
    'X_RETWEET': 'RT',
    'X_QUOTE': 'QT',
    'X_COMMENT': 'CMNT',
    'X_TWEET': 'OT',
    'X_SPACE_HOST': 'SPACE',
    'X_SHARE': 'RT', // Share maps to Retweet
    'X_CUSTOM': 'GENERAL'
  }
  
  return mapping[subTaskType] || 'GENERAL'
}

/**
 * Checks if a SubTaskType requires Twitter verification
 * @param subTaskType - The subtask type to check
 * @returns true if the subtask type is Twitter-related and can be verified
 */
export function isTwitterVerifiableType(subTaskType?: string | null): boolean {
  if (!subTaskType) return false
  
  const twitterTypes = ['X_LIKE', 'X_RETWEET', 'X_QUOTE', 'X_COMMENT', 'X_TWEET', 'X_SHARE']
  return twitterTypes.includes(subTaskType)
}

export function getTaskTypeConfig(taskType?: TaskType | null): TaskTypeConfig {
  if (!taskType) return TASK_TYPE_CONFIGS.GENERAL
  return TASK_TYPE_CONFIGS[taskType] || TASK_TYPE_CONFIGS.GENERAL
}