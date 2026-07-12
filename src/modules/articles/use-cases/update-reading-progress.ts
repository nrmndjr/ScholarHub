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

  await deps.prisma.article.update({
    where: { id: articleId },
    data: {
      currentPage: input.currentPage,
      totalPages: input.totalPages ?? article.totalPages,
      lastOpenedAt: new Date(),
      status: article.status === 'NAO_INICIADO' ? 'LENDO' : article.status,
    },
  });

  // A session stays open (no endedAt) until the reader unmounts (see closeOpenReadingSession),
  // so re-open a new one per *visit* rather than once per article's lifetime — otherwise
  // reopening an article on a later day never gets its own session, breaking streaks/analytics.
  const openSession = await deps.prisma.readingSession.findFirst({
    where: { articleId, userId, endedAt: null },
  });
  if (!openSession) {
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
