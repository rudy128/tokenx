-- Update existing subtasks with default type if NULL
-- This script ensures all existing subtasks have a type value

-- Update SubTask table (for NewTask model)
UPDATE subtasks 
SET type = 'X_TWEET' 
WHERE type IS NULL;

-- Update TaskSubTask table (for Task model)
UPDATE task_subtasks 
SET type = 'X_TWEET' 
WHERE type IS NULL;

-- Verify the updates
SELECT 'SubTask' as table_name, COUNT(*) as total_count, 
       COUNT(CASE WHEN type IS NOT NULL THEN 1 END) as with_type_count
FROM subtasks
UNION ALL
SELECT 'TaskSubTask' as table_name, COUNT(*) as total_count,
       COUNT(CASE WHEN type IS NOT NULL THEN 1 END) as with_type_count
FROM task_subtasks;
