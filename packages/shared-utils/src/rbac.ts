import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role.toUpperCase() !== 'ADMIN') {
    return { user, isAdmin: false };
  }
  return { user, isAdmin: true };
}
