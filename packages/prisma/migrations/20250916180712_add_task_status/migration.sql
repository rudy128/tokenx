-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "public"."TaskFrequency" AS ENUM ('one_time', 'daily', 'weekly', 'monthly', 'recurring');

-- CreateEnum
CREATE TYPE "public"."EvidenceMode" AS ENUM ('auto', 'manual');

-- CreateEnum
CREATE TYPE "public"."ApprovalWorkflow" AS ENUM ('auto', 'manual');

-- CreateEnum
CREATE TYPE "public"."SubmissionState" AS ENUM ('in_progress', 'submitted', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "status" "public"."TaskStatus" NOT NULL DEFAULT 'draft';

-- CreateTable
CREATE TABLE "public"."new_tasks" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'draft',
    "campaignId" UUID,
    "xp" INTEGER NOT NULL,
    "rewardOverride" BOOLEAN NOT NULL DEFAULT false,
    "rewardToken" TEXT,
    "rewardAmount" DECIMAL(18,6),
    "frequency" "public"."TaskFrequency" NOT NULL DEFAULT 'one_time',
    "perUserCap" INTEGER,
    "globalCap" INTEGER,
    "availableFrom" TIMESTAMPTZ,
    "availableTo" TIMESTAMPTZ,
    "submissionCutoff" TIMESTAMPTZ,
    "gracePeriodHours" INTEGER,
    "evidenceMode" "public"."EvidenceMode" NOT NULL DEFAULT 'manual',
    "requiredFields" JSONB,
    "exampleProofUrls" JSONB,
    "approvalWorkflow" "public"."ApprovalWorkflow" NOT NULL DEFAULT 'auto',
    "uniqueContent" BOOLEAN NOT NULL DEFAULT true,
    "minAccountAgeDays" INTEGER,
    "minFollowers" INTEGER,
    "ipAnomalyCheck" BOOLEAN NOT NULL DEFAULT false,
    "deviceAnomalyCheck" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "new_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."new_task_submissions" (
    "id" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" UUID NOT NULL,
    "status" "public"."SubmissionState" NOT NULL DEFAULT 'in_progress',
    "evidence" JSONB,
    "xpAwarded" INTEGER,
    "bonusAwarded" DECIMAL(18,6),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "new_task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_pinned_tasks" (
    "userId" TEXT NOT NULL,
    "taskId" UUID NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pinned_tasks_pkey" PRIMARY KEY ("userId","taskId")
);

-- CreateIndex
CREATE INDEX "new_tasks_campaignId_idx" ON "public"."new_tasks"("campaignId");

-- CreateIndex
CREATE INDEX "new_task_submissions_userId_taskId_idx" ON "public"."new_task_submissions"("userId", "taskId");

-- CreateIndex
CREATE INDEX "idx_campaign_createdAt" ON "public"."Campaign"("createdAt");

-- CreateIndex
CREATE INDEX "idx_campaign_status" ON "public"."Campaign"("status");

-- CreateIndex
CREATE INDEX "idx_campaign_status_createdAt" ON "public"."Campaign"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."new_task_submissions" ADD CONSTRAINT "new_task_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."new_task_submissions" ADD CONSTRAINT "new_task_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."new_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_pinned_tasks" ADD CONSTRAINT "user_pinned_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_pinned_tasks" ADD CONSTRAINT "user_pinned_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."new_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
