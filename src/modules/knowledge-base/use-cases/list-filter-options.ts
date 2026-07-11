import type { PrismaClient } from '@/generated/prisma/client';

function uniqueBy<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((i) => [i.id, i])).values());
}

export async function listKnowledgeBaseFilterOptions(userId: string, deps: { prisma: PrismaClient }) {
  const [articles, highlightTags] = await Promise.all([
    deps.prisma.article.findMany({
      where: { userId, highlights: { some: {} } },
      select: {
        year: true,
        folder: { select: { id: true, name: true } },
        journal: { select: { id: true, name: true } },
        projects: { select: { project: { select: { id: true, name: true } } } },
        authors: { select: { author: { select: { id: true, name: true } } } },
      },
    }),
    deps.prisma.tag.findMany({
      where: { userId, highlights: { some: {} } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return {
    folders: uniqueBy(articles.map((a) => a.folder).filter((f): f is NonNullable<typeof f> => !!f)),
    journals: uniqueBy(articles.map((a) => a.journal).filter((j): j is NonNullable<typeof j> => !!j)),
    projects: uniqueBy(articles.flatMap((a) => a.projects.map((p) => p.project))),
    authors: uniqueBy(articles.flatMap((a) => a.authors.map((au) => au.author))),
    tags: highlightTags,
    years: Array.from(new Set(articles.map((a) => a.year).filter((y): y is number => y != null))).sort(
      (a, b) => b - a
    ),
  };
}
