import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function archiveArticleToLibrary(articleId: string, userId: string, deps: { prisma: PrismaClient }) {
  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  await deps.prisma.article.update({
    where: { id: articleId },
    data: { stage: 'LIBRARY', archivedAt: new Date() },
  });
}
