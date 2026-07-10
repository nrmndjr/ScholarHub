import type { PrismaClient } from '@/generated/prisma/client';

export function listProjects(userId: string, deps: { prisma: PrismaClient }) {
  return deps.prisma.project.findMany({ where: { userId }, orderBy: { name: 'asc' } });
}
