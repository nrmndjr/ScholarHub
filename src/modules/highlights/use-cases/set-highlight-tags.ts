import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function setHighlightTags(
  highlightId: string,
  userId: string,
  tagIds: string[],
  deps: { prisma: PrismaClient }
) {
  const highlight = await deps.prisma.highlight.findFirst({ where: { id: highlightId, userId } });
  if (!highlight) throw new NotFoundError('Destaque não encontrado');

  await deps.prisma.highlightTag.deleteMany({ where: { highlightId } });
  if (tagIds.length > 0) {
    await deps.prisma.highlightTag.createMany({ data: tagIds.map((tagId) => ({ highlightId, tagId })) });
  }
}
