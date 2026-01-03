# Database Migration Instructions - Platform Flow Correction

## Overview
This migration corrects the entire platform's database schema to align with the proper flow:
- **Admin**: Manages all users (ban/delete), manages campaigns and tasks created by organizations
- **Clients (Ambassadors)**: Join campaigns, complete tasks/sub-tasks, earn rewards
- **Organizations**: Create and manage campaigns, tasks, and sub-tasks (future implementation)

## Major Changes

### 1. Organization Models Added
- **Organization**: New model to represent organizations
  - Fields: name, description, website, logo, status
  - Relations: members, campaigns, tasks

- **OrganizationMember**: Links users to organizations with dynamic roles
  - `role`: String field that stores custom role names set by organization leadership
  - Supports any role name (e.g., "Manager", "Developer", "Tester", "COO", etc.)
  - No hardcoded role restrictions - organization decides their own hierarchy
  - Future: Can add role-based filtering when needed

### 2. Task Models Consolidated
**REMOVED** (Duplicates):
- `NewTask` model → merged into `Task`
- `NewTaskSubmission` model → merged into `TaskSubmission`
- `TaskSubTask` model → merged into `SubTask`

**KEPT & ENHANCED**:
- `Task`: Single unified model for all campaign tasks (daily, one-time, etc.)
- `SubTask`: Subtasks belonging to tasks
- `TaskSubmission`: All task submissions with comprehensive fields
- `UserPinnedTask`: User's pinned tasks

### 3. Enum Type Improvements
All appropriate fields now use proper enums:

#### New Enums:
- `OrganizationStatus`: ACTIVE, INACTIVE, SUSPENDED
- `UserRole`: ADMIN, AMBASSADOR, ORGANIZATION (was `Role`)
- `AuthProvider`: google, twitter, discord, github, credentials
- `RewardToken`: USDT, USDC, ETH, MATIC, BNB, SOL, AVAX, ARB
- `TaskType`: GENERAL, SOCIAL_MEDIA, CONTENT_CREATION, TECHNICAL, FEEDBACK, BUSINESS_DEVELOPMENT, COMMUNITY_MANAGEMENT, EVENT_MANAGEMENT, REFERRAL, CUSTOM
- `CreatorRole`: ADMIN, ORGANIZATION
- `Tier`: Added DIAMOND tier

#### Enhanced Enums:
- `SubTaskType`: X_LIKE, X_COMMENT, X_SHARE, X_SPACE_HOST, X_QUOTE, X_RETWEET, X_TWEET, X_FOLLOW, X_CUSTOM, CUSTOM (removed unnecessary platform types)
- `SubmissionStatus`: Added IN_PROGRESS
- `TaskStatus`: Added completed, cancelled

### 4. Campaign & Task Tracking
- Added `createdByRole` field to Campaign and Task models
- Added `organizationId` field to link campaigns/tasks to organizations
- Proper creator tracking with User relations

### 5. Removed Fields
- `password` field from User model (using Clerk authentication)
- Duplicate/legacy models and submissions

### 6. Schema Optimizations
- Proper cascade deletes on all relations
- Comprehensive indexes for performance
- UUID support for Task IDs
- Decimal precision for reward amounts
- Timestamp with timezone support

## Database Schema Structure

```
Organizations
├── Organization (organizations table)
└── OrganizationMember (organization_members table)

Authentication
├── Account (with AuthProvider enum)
└── Session

Users
└── User (with UserRole enum, removed password field)

Campaigns
├── Campaign (with RewardToken enum, createdByRole, organizationId)
└── CampaignParticipation

Tasks (Consolidated)
├── Task (tasks table - unified model)
├── SubTask (subtasks table)
├── TaskSubmission (task_submissions table)
├── UserPinnedTask (user_pinned_tasks table)
└── VerificationAction
```

## Migration Steps

### Step 1: Backup Current Database
```bash
# Create a backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Review Schema Changes
```bash
cd /workspaces/ambassador-tokenX/packages/prisma

# Check what changes will be made
npx prisma migrate diff \
  --from-schema-datamodel schema-old.prisma \
  --to-schema-datamodel schema.prisma \
  --script > migration_preview.sql

# Review the preview
cat migration_preview.sql
```

### Step 3: Create Migration
```bash
cd /workspaces/ambassador-tokenX/packages/prisma

# Create migration files
npx prisma migrate dev --name platform_flow_correction --create-only

# Review the generated migration in packages/prisma/migrations/
# Make any necessary adjustments to the SQL
```

### Step 4: Apply Migration
```bash
# Apply the migration
npx prisma migrate dev

# Or for production
npx prisma migrate deploy
```

### Step 5: Generate Prisma Client
```bash
npx prisma generate
```

### Step 6: Data Migration (if needed)
If you have existing data that needs to be migrated from old models to new:

```bash
# Run data migration script
cd /workspaces/ambassador-tokenX
npm run migrate:data
```

## Code Changes Required

### Admin Side Changes
1. **Remove Creation Routes** (keep management):
   - Remove: `/api/campaigns/route.ts` POST endpoint
   - Remove: `/api/tasks/route.ts` POST endpoint
   - Keep: All GET, PUT, DELETE endpoints for management

2. **Update Imports**:
   ```typescript
   // Old
   import { Role } from "@prisma/client"
   
   // New
   import { UserRole } from "@prisma/client"
   ```

3. **Update Task References**:
   ```typescript
   // All task queries now use unified Task model
   const tasks = await prisma.task.findMany({
     include: {
       SubTasks: true, // Changed from taskSubTasks
       Campaign: true,
       Organization: true // New relation
     }
   })
   ```

### Client Side Changes
1. **Update Task Queries**:
   ```typescript
   // Old
   const task = await prisma.newTask.findUnique(...)
   
   // New
   const task = await prisma.task.findUnique(...)
   ```

2. **Update Submission Queries**:
   ```typescript
   // Old
   const submission = await prisma.newTaskSubmission.create(...)
   
   // New
   const submission = await prisma.taskSubmission.create(...)
   ```

3. **Update Provider Type**:
   ```typescript
   // Old
   if (account?.provider === "google") // string comparison
   
   // New
   import { AuthProvider } from "@prisma/client"
   if (account?.provider === AuthProvider.google) // enum
   ```

## Testing Checklist

- [ ] Admin can view all campaigns and tasks
- [ ] Admin can manage (edit/delete) campaigns and tasks
- [ ] Admin cannot create new campaigns/tasks
- [ ] Clients can join campaigns
- [ ] Clients can view tasks from joined campaigns
- [ ] Clients can complete tasks and subtasks
- [ ] Clients can earn XP and rewards
- [ ] Twitter username is properly saved in profile
- [ ] Daily tasks page shows all tasks from joined campaigns
- [ ] Organization models are ready for future implementation

## Rollback Plan

If issues occur:

```bash
# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql

# Revert schema
cd /workspaces/ambassador-tokenX/packages/prisma
mv schema.prisma schema-new-failed.prisma
mv schema-old.prisma schema.prisma

# Regenerate client
npx prisma generate
```

## Notes

- Old schema backup: `packages/prisma/schema-old.prisma`
- All TaskTypes found in UI are now proper enums
- RewardToken is now enum (was String)
- AuthProvider is now enum (was String)
- Organization interface will be built in future using these models
- Daily tasks page is just a view of all tasks from joined campaigns

## Support

For issues or questions during migration:
1. Check the backup file is created before proceeding
2. Review migration preview SQL carefully
3. Test in development environment first
4. Keep old schema file for reference

npx prisma studio
```

### Rollback (if needed):

```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Or manually revert the migration
npx prisma migrate resolve --rolled-back <migration-name>
```

## Notes:

- The `proofImageUrl` field is nullable to support tasks that don't require proof uploads
- The `reviewedBy` and `reviewNotes` fields are nullable as they're only set after review
- Make sure to backup your database before running migrations in production
