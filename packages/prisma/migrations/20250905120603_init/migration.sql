-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'AMBASSADOR');

-- CreateEnum
CREATE TYPE "public"."Tier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TaskCategory" AS ENUM ('SOCIAL_ENGAGEMENT', 'CONTENT_CREATION', 'COMMUNITY_BUILDING', 'REFERRAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."VerificationMethod" AS ENUM ('AI_AUTO', 'MANUAL', 'HYBRID');

-- CreateEnum
CREATE TYPE "public"."ParticipationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION');

-- CreateEnum
CREATE TYPE "public"."ReviewAction" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CLARIFICATION');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'AMBASSADOR',
    "walletAddress" TEXT,
    "tier" "public"."Tier" NOT NULL DEFAULT 'BRONZE',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "tokenBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usdtBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastSignedIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "participantLimit" INTEGER,
    "eligibilityCriteria" TEXT,
    "rewardPool" DOUBLE PRECISION NOT NULL,
    "rewardToken" TEXT NOT NULL DEFAULT 'USDT',
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."TaskCategory" NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "verificationMethod" "public"."VerificationMethod" NOT NULL DEFAULT 'MANUAL',
    "requirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CampaignParticipation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "status" "public"."ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskSubmission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "proofUrl" TEXT,
    "screenshot" TEXT,
    "description" TEXT,
    "status" "public"."SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationAction" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "action" "public"."ReviewAction" NOT NULL,
    "comment" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "public"."User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignParticipation_userId_campaignId_key" ON "public"."CampaignParticipation"("userId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_taskId_userId_key" ON "public"."TaskSubmission"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskSubmission" ADD CONSTRAINT "TaskSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationAction" ADD CONSTRAINT "VerificationAction_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."TaskSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VerificationAction" ADD CONSTRAINT "VerificationAction_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
