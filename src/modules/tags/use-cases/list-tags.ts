import type { PrismaClient } from '@/generated/prisma/client';

export function listTags(userId: string, deps: { prisma: PrismaClient }) {
  return deps.prisma.tag.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}
