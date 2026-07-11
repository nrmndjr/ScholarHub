import type { PrismaClient } from '@/generated/prisma/client';
import type { TagWithCount } from '../domain/entities';

export async function listTagsWithCounts(userId: string, deps: { prisma: PrismaClient }): Promise<TagWithCount[]> {
  const tags = await deps.prisma.tag.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { highlights: true } } },
  });

  return tags
    .map((tag) => ({ id: tag.id, name: tag.name, color: tag.color, highlightCount: tag._count.highlights }))
    .filter((tag) => tag.highlightCount > 0)
    .sort((a, b) => b.highlightCount - a.highlightCount);
}
