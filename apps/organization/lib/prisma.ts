import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Explicitly check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not defined in environment variables. ' +
    'Please check your .env file.'
  )
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper functions for organization app

export async function getOrganizations() {
  return await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          members: true,
          campaigns: true,
        },
      },
    },
  });
}

export async function getOrganizationById(id: string) {
  return await prisma.organization.findUnique({
    where: { id },
    include: {
      members: true,
      campaigns: true,
    },
  });
}

export async function createOrganization(data: {
  name: string;
  slug: string;
  description?: string;
}) {
  return await prisma.organization.create({
    data,
  });
}
