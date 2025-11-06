/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "public"."TaskCategory" ADD VALUE 'GENERAL';

-- Drop the foreign key constraint first
ALTER TABLE "public"."TaskSubmission" DROP CONSTRAINT "TaskSubmission_taskId_fkey";

-- AlterTable
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_pkey",
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "category" SET DEFAULT 'CUSTOM',
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");

-- AlterTable - Update TaskSubmission to match new Task ID type
ALTER TABLE "public"."TaskSubmission" 
DROP COLUMN "taskId",
ADD COLUMN "taskId" UUID NOT NULL,
ADD COLUMN "evidence" TEXT,
ADD COLUMN "submissionText" TEXT;

-- Recreate the foreign key constraint
ALTER TABLE "public"."TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
