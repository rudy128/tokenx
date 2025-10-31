export type TaskType = 'LIKE' | 'RT' | 'QT' | 'CMNT' | 'OT' | 'VID' | 'BLOG' | 'TXT' | 'INV' | 'SURVEY' | 'AMA' | 'SPACE' | 'MUP' | 'GENERAL'

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

export function getTaskTypeConfig(taskType?: TaskType | null): TaskTypeConfig {
  if (!taskType) return TASK_TYPE_CONFIGS.GENERAL
  return TASK_TYPE_CONFIGS[taskType] || TASK_TYPE_CONFIGS.GENERAL
}