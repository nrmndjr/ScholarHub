import type { PrismaClient } from '@/generated/prisma/client';

export function listFolders(userId: string, deps: { prisma: PrismaClient }) {
  return deps.prisma.folder.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}
