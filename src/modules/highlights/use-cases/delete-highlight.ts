import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function deleteHighlight(highlightId: string, userId: string, deps: { prisma: PrismaClient }) {
  const highlight = await deps.prisma.highlight.findFirst({ where: { id: highlightId, userId } });
  if (!highlight) throw new NotFoundError('Destaque não encontrado');

  await deps.prisma.highlight.delete({ where: { id: highlightId } });
}
