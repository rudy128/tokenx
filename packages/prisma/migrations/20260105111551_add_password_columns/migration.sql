/*
  Warnings:

  - The `rewardToken` column on the `Campaign` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `new_task_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `new_tasks` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `provider` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AMBASSADOR', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('google', 'twitter', 'discord', 'github', 'credentials');

-- CreateEnum
CREATE TYPE "RewardToken" AS ENUM ('USDT', 'USDC', 'ETH', 'MATIC', 'BNB', 'SOL', 'AVAX', 'ARB');

-- CreateEnum
CREATE TYPE "CreatorRole" AS ENUM ('ADMIN', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('GENERAL', 'SOCIAL_MEDIA', 'CONTENT_CREATION', 'TECHNICAL', 'FEEDBACK', 'BUSINESS_DEVELOPMENT', 'COMMUNITY_MANAGEMENT', 'EVENT_MANAGEMENT', 'REFERRAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubTaskType" AS ENUM ('X_LIKE', 'X_COMMENT', 'X_SHARE', 'X_SPACE_HOST', 'X_QUOTE', 'X_RETWEET', 'X_TWEET', 'X_FOLLOW', 'X_CUSTOM', 'CUSTOM');

-- AlterEnum
ALTER TYPE "SubmissionStatus" ADD VALUE 'IN_PROGRESS';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TaskStatus" ADD VALUE 'completed';
ALTER TYPE "TaskStatus" ADD VALUE 'cancelled';

-- AlterEnum
ALTER TYPE "Tier" ADD VALUE 'DIAMOND';

-- DropForeignKey
ALTER TABLE "CampaignParticipation" DROP CONSTRAINT "CampaignParticipation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignParticipation" DROP CONSTRAINT "CampaignParticipation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_userId_fkey";

-- DropForeignKey
ALTER TABLE "VerificationAction" DROP CONSTRAINT "VerificationAction_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "new_task_submissions" DROP CONSTRAINT "new_task_submissions_taskId_fkey";

-- DropForeignKey
ALTER TABLE "new_task_submissions" DROP CONSTRAINT "new_task_submissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_pinned_tasks" DROP CONSTRAINT "user_pinned_tasks_taskId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "provider",
ADD COLUMN     "provider" "AuthProvider" NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "createdByRole" "CreatorRole" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "organizationId" TEXT,
DROP COLUMN "rewardToken",
ADD COLUMN     "rewardToken" "RewardToken" NOT NULL DEFAULT 'USDT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedAt" TIMESTAMP(3),
ADD COLUMN     "bannedBy" TEXT,
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twitterUsername" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'AMBASSADOR';

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskSubmission";

-- DropTable
DROP TABLE "new_task_submissions";

-- DropTable
DROP TABLE "new_tasks";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "SubmissionState";

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    "bannedBy" TEXT,
    "bannedReason" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "permissions" JSONB,
    "passwordHash" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "category" "TaskCategory" NOT NULL DEFAULT 'CUSTOM',
    "taskType" "TaskType" NOT NULL DEFAULT 'GENERAL',
    "xpReward" INTEGER NOT NULL,
    "rewardOverride" BOOLEAN NOT NULL DEFAULT false,
    "rewardToken" "RewardToken",
    "rewardAmount" DECIMAL(18,6),
    "verificationMethod" "VerificationMethod" NOT NULL DEFAULT 'MANUAL',
    "evidenceMode" "EvidenceMode" NOT NULL DEFAULT 'manual',
    "approvalWorkflow" "ApprovalWorkflow" NOT NULL DEFAULT 'manual',
    "requirements" JSONB,
    "requiredFields" JSONB,
    "exampleProofUrls" JSONB,
    "status" "TaskStatus" NOT NULL DEFAULT 'draft',
    "frequency" "TaskFrequency" NOT NULL DEFAULT 'one_time',
    "perUserCap" INTEGER,
    "globalCap" INTEGER,
    "availableFrom" TIMESTAMPTZ(6),
    "availableTo" TIMESTAMPTZ(6),
    "submissionCutoff" TIMESTAMPTZ(6),
    "gracePeriodHours" INTEGER,
    "uniqueContent" BOOLEAN NOT NULL DEFAULT true,
    "minAccountAgeDays" INTEGER,
    "minFollowers" INTEGER,
    "ipAnomalyCheck" BOOLEAN NOT NULL DEFAULT false,
    "deviceAnomalyCheck" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdByRole" "CreatorRole" NOT NULL DEFAULT 'ADMIN',
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtasks" (
    "id" TEXT NOT NULL,
    "taskId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isUploadProof" BOOLEAN NOT NULL DEFAULT false,
    "type" "SubTaskType" NOT NULL DEFAULT 'X_TWEET',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" UUID NOT NULL,
    "subTaskId" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "evidence" JSONB,
    "proofUrl" TEXT,
    "proofImageUrl" TEXT,
    "screenshot" TEXT,
    "description" TEXT,
    "xpAwarded" INTEGER,
    "bonusAwarded" DECIMAL(18,6),
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organization_members_organizationId_idx" ON "organization_members"("organizationId");

-- CreateIndex
CREATE INDEX "organization_members_userId_idx" ON "organization_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "tasks_campaignId_idx" ON "tasks"("campaignId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- CreateIndex
CREATE INDEX "subtasks_taskId_idx" ON "subtasks"("taskId");

-- CreateIndex
CREATE INDEX "task_submissions_taskId_idx" ON "task_submissions"("taskId");

-- CreateIndex
CREATE INDEX "task_submissions_userId_idx" ON "task_submissions"("userId");

-- CreateIndex
CREATE INDEX "task_submissions_status_idx" ON "task_submissions"("status");

-- CreateIndex
CREATE INDEX "task_submissions_subTaskId_idx" ON "task_submissions"("subTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_submissions_taskId_userId_subTaskId_key" ON "task_submissions"("taskId", "userId", "subTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Campaign_organizationId_idx" ON "Campaign"("organizationId");

-- CreateIndex
CREATE INDEX "CampaignParticipation_campaignId_idx" ON "CampaignParticipation"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignParticipation_userId_idx" ON "CampaignParticipation"("userId");

-- CreateIndex
CREATE INDEX "VerificationAction_submissionId_idx" ON "VerificationAction"("submissionId");

-- CreateIndex
CREATE INDEX "VerificationAction_reviewerId_idx" ON "VerificationAction"("reviewerId");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtasks" ADD CONSTRAINT "subtasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_pinned_tasks" ADD CONSTRAINT "user_pinned_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationAction" ADD CONSTRAINT "VerificationAction_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "task_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
