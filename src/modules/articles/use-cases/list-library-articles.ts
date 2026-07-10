import type { Prisma, PrismaClient } from '@/generated/prisma/client';

export interface LibraryFilters {
  projectId?: string;
  folderId?: string;
  authorId?: string;
  journalId?: string;
  status?: string;
  tagId?: string;
  year?: number;
  favoritesOnly?: boolean;
}

export type LibrarySort = 'lastRead' | 'createdAt' | 'year' | 'author' | 'highlights' | 'title';

const SORT_TO_ORDERBY: Partial<Record<LibrarySort, Prisma.ArticleOrderByWithRelationInput>> = {
  lastRead: { lastOpenedAt: 'desc' },
  createdAt: { createdAt: 'desc' },
  year: { year: 'desc' },
  highlights: { highlights: { _count: 'desc' } },
  title: { title: 'asc' },
};

export async function listLibraryArticles(
  input: { userId: string; filters: LibraryFilters; sort: LibrarySort },
  deps: { prisma: PrismaClient }
) {
  const where: Prisma.ArticleWhereInput = {
    userId: input.userId,
    stage: 'LIBRARY',
  };

  if (input.filters.projectId) where.projects = { some: { projectId: input.filters.projectId } };
  if (input.filters.folderId) where.folderId = input.filters.folderId;
  if (input.filters.authorId) where.authors = { some: { authorId: input.filters.authorId } };
  if (input.filters.journalId) where.journalId = input.filters.journalId;
  if (input.filters.status) where.status = input.filters.status;
  if (input.filters.tagId) where.tags = { some: { tagId: input.filters.tagId } };
  if (input.filters.year) where.year = input.filters.year;
  if (input.filters.favoritesOnly) where.favorite = true;

  const articles = await deps.prisma.article.findMany({
    where,
    orderBy: SORT_TO_ORDERBY[input.sort] ?? { title: 'asc' },
    include: {
      file: true,
      folder: true,
      journal: true,
      tags: { include: { tag: true } },
      projects: { include: { project: true } },
      authors: { include: { author: true }, orderBy: { position: 'asc' } },
      readingSessions: { select: { durationSeconds: true } },
      _count: { select: { highlights: true, comments: true } },
    },
  });

  if (input.sort === 'author') {
    articles.sort((a, b) => (a.authors[0]?.author.name ?? '').localeCompare(b.authors[0]?.author.name ?? ''));
  }

  return articles;
}

export async function listLibraryFilterOptions(userId: string, deps: { prisma: PrismaClient }) {
  const articles = await deps.prisma.article.findMany({
    where: { userId, stage: 'LIBRARY' },
    select: {
      year: true,
      folder: { select: { id: true, name: true } },
      journal: { select: { id: true, name: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      projects: { select: { project: { select: { id: true, name: true } } } },
      authors: { select: { author: { select: { id: true, name: true } } } },
    },
  });

  const uniqueBy = <T extends { id: string }>(items: T[]) => Array.from(new Map(items.map((i) => [i.id, i])).values());

  return {
    folders: uniqueBy(articles.map((a) => a.folder).filter((f): f is NonNullable<typeof f> => !!f)),
    journals: uniqueBy(articles.map((a) => a.journal).filter((j): j is NonNullable<typeof j> => !!j)),
    tags: uniqueBy(articles.flatMap((a) => a.tags.map((t) => t.tag))),
    projects: uniqueBy(articles.flatMap((a) => a.projects.map((p) => p.project))),
    authors: uniqueBy(articles.flatMap((a) => a.authors.map((au) => au.author))),
    years: Array.from(new Set(articles.map((a) => a.year).filter((y): y is number => y != null))).sort(
      (a, b) => b - a
    ),
  };
}
