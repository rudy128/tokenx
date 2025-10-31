'use server';

import { auth } from '@clerk/nextjs/server';


import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TaskStatus, TaskCategory } from '@prisma/client';

export async function createAndActivateTask(taskData: any) {
  try {
    // Basic validation
    if (!taskData.taskName || !taskData.category) {
        throw new Error("Task name and category are required.");
    }

    const { randomUUID } = await import('crypto');
    await prisma.task.create({
      data: {
        id: randomUUID(),
        name: taskData.taskName,
        description: taskData.description,
        xpReward: parseInt(taskData.xp === 'custom' ? taskData.customXp : String(taskData.xp), 10) || 0,
        category: taskData.category as TaskCategory,
        campaignId: "sample-campaign1",
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/daily-tasks');
    revalidatePath('/ambassador-dashboard');

    return { success: true, message: "Task activated successfully!" };
  } catch (error) {
    console.error("Failed to create and activate task:", error);
    return { success: false, message: (error as Error).message || "Failed to activate task." };
  }
}
