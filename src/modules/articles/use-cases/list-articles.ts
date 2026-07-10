import type { PrismaClient } from '@/generated/prisma/client';
import type { ArticleStage } from '@/modules/articles/domain/entities';

export function listArticles(
  filter: { userId: string; stage: ArticleStage },
  deps: { prisma: PrismaClient }
) {
  return deps.prisma.article.findMany({
    where: { userId: filter.userId, stage: filter.stage },
    orderBy: { createdAt: 'desc' },
    include: {
      file: true,
      folder: true,
      journal: true,
      tags: { include: { tag: true } },
      projects: { include: { project: true } },
      authors: { include: { author: true }, orderBy: { position: 'asc' } },
      processingJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { highlights: true, comments: true } },
    },
  });
}

export function getArticleForUser(articleId: string, userId: string, deps: { prisma: PrismaClient }) {
  return deps.prisma.article.findFirst({
    where: { id: articleId, userId },
    include: {
      file: true,
      folder: true,
      journal: true,
      tags: { include: { tag: true } },
      projects: { include: { project: true } },
      authors: { include: { author: true }, orderBy: { position: 'asc' } },
    },
  });
}
