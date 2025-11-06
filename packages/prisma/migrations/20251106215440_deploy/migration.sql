/*
  Warnings:

  - The values [GENERAL] on the enum `TaskCategory` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `instructions` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `evidence` on the `TaskSubmission` table. All the data in the column will be lost.
  - You are about to drop the column `submissionText` on the `TaskSubmission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taskId,userId]` on the table `TaskSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskCategory_new" AS ENUM ('SOCIAL_ENGAGEMENT', 'CONTENT_CREATION', 'COMMUNITY_BUILDING', 'REFERRAL', 'CUSTOM');
ALTER TABLE "public"."Task" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "category" TYPE "TaskCategory_new" USING ("category"::text::"TaskCategory_new");
ALTER TYPE "TaskCategory" RENAME TO "TaskCategory_old";
ALTER TYPE "TaskCategory_new" RENAME TO "TaskCategory";
DROP TYPE "public"."TaskCategory_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "TaskSubmission" DROP CONSTRAINT "TaskSubmission_taskId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "instructions",
DROP COLUMN "isActive",
ALTER COLUMN "category" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskSubmission" DROP COLUMN "evidence",
DROP COLUMN "submissionText",
ALTER COLUMN "taskId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "new_tasks" ADD COLUMN     "taskType" TEXT NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_taskId_userId_key" ON "TaskSubmission"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
