export type SubTaskType = 
  | 'X_LIKE'
  | 'X_COMMENT'
  | 'X_SHARE'
  | 'X_SPACE_HOST'
  | 'X_QUOTE'
  | 'X_RETWEET'
  | 'X_TWEET'
  | 'X_CUSTOM'

export const SUB_TASK_TYPE_LABELS: Record<SubTaskType, string> = {
  X_LIKE: 'X Like',
  X_COMMENT: 'X Comment',
  X_SHARE: 'X Share',
  X_SPACE_HOST: 'X Space Host',
  X_QUOTE: 'X Quote',
  X_RETWEET: 'X Retweet',
  X_TWEET: 'X Tweet',
  X_CUSTOM: 'X Custom',
}

export function getSubTaskTypeLabel(type: SubTaskType | string): string {
  return SUB_TASK_TYPE_LABELS[type as SubTaskType] || 'X Tweet'
}

export function getSubTaskTypeBadgeColor(type: SubTaskType | string): string {
  const colors: Record<SubTaskType, string> = {
    X_LIKE: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    X_COMMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    X_SHARE: 'bg-green-500/20 text-green-400 border-green-500/30',
    X_SPACE_HOST: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    X_QUOTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    X_RETWEET: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    X_TWEET: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    X_CUSTOM: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return colors[type as SubTaskType] || colors.X_TWEET
}
