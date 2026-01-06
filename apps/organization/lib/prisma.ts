import { prisma } from "@repo/prisma";

// Example usage in organization app

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
