# Database Migration Instructions

## TaskSubmission Schema Update

The Prisma schema has been updated to include additional fields for the TaskSubmission model.

### Changes Made:

1. **Added new fields to TaskSubmission:**
   - `proofImageUrl` - Store uploaded proof image path
   - `reviewedBy` - ID of the user who reviewed the submission
   - `reviewNotes` - Notes from the reviewer
   - `createdAt` - Timestamp when record was created
   - `updatedAt` - Timestamp when record was last updated

2. **Added indexes for better query performance:**
   - Index on `taskId`
   - Index on `userId`
   - Index on `status`

3. **Added table mapping:**
   - Table name: `task_submissions`

4. **Updated cascade actions:**
   - `onDelete: NoAction`
   - `onUpdate: NoAction`

### To Apply the Migration:

```bash
# Navigate to the prisma package
cd packages/prisma

# Create a new migration
npx prisma migrate dev --name add_task_submission_fields

# Generate Prisma Client
npx prisma generate

# Push to database (alternative to migrate)
# npx prisma db push
```

### Verify Migration:

```bash
# Check migration status
npx prisma migrate status

# View the database schema
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
