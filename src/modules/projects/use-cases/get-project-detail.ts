import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function getProjectDetail(projectId: string, userId: string, deps: { prisma: PrismaClient }) {
  const project = await deps.prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Projeto não encontrado');

  const articleLinks = await deps.prisma.articleProject.findMany({
    where: { projectId },
    include: {
      article: {
        include: {
          authors: { include: { author: true }, orderBy: { position: 'asc' } },
          journal: true,
          _count: { select: { highlights: true, comments: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' },
  });

  const articles = articleLinks.map((link) => link.article);

  const authorFrequency = new Map<string, number>();
  const journalFrequency = new Map<string, number>();
  const yearDistribution = new Map<number, number>();

  for (const article of articles) {
    for (const { author } of article.authors) {
      authorFrequency.set(author.name, (authorFrequency.get(author.name) ?? 0) + 1);
    }
    if (article.journal) {
      journalFrequency.set(article.journal.name, (journalFrequency.get(article.journal.name) ?? 0) + 1);
    }
    if (article.year) {
      yearDistribution.set(article.year, (yearDistribution.get(article.year) ?? 0) + 1);
    }
  }

  const toSortedEntries = (map: Map<string, number>) =>
    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({ label, count }));

  return {
    project,
    articles,
    readingInProgress: articles.filter((a) => a.status === 'LENDO'),
    dashboard: {
      topAuthors: toSortedEntries(authorFrequency),
      topJournals: toSortedEntries(journalFrequency),
      yearDistribution: Array.from(yearDistribution.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([year, count]) => ({ year, count })),
    },
  };
}
