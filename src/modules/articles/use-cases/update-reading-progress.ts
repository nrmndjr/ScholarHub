import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function updateReadingProgress(
  articleId: string,
  userId: string,
  input: { currentPage: number; totalPages?: number },
  deps: { prisma: PrismaClient }
) {
  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  const isFirstOpen = !article.lastOpenedAt;

  await deps.prisma.article.update({
    where: { id: articleId },
    data: {
      currentPage: input.currentPage,
      totalPages: input.totalPages ?? article.totalPages,
      lastOpenedAt: new Date(),
      status: article.status === 'NAO_INICIADO' ? 'LENDO' : article.status,
    },
  });

  if (isFirstOpen) {
    await deps.prisma.readingSession.create({
      data: { userId, articleId, startPage: input.currentPage },
    });
  }
}

export async function updateSummary(
  articleId: string,
  userId: string,
  summaryContent: object,
  deps: { prisma: PrismaClient }
) {
  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  await deps.prisma.article.update({
    where: { id: articleId },
    data: { summaryContent, summaryUpdatedAt: new Date() },
  });
}
