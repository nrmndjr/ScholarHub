import type { PrismaClient } from '@/generated/prisma/client';
import type { HighlightColor } from '@/modules/highlights/domain/entities';

const LIMIT = 5;

export interface GlobalSearchResults {
  articles: Array<{ id: string; title: string; authors: string[]; year: number | null }>;
  highlights: Array<{
    id: string;
    excerptText: string;
    color: HighlightColor;
    page: number;
    articleId: string;
    articleTitle: string;
  }>;
  tags: Array<{ id: string; name: string; highlightCount: number }>;
  projects: Array<{ id: string; name: string }>;
}

export async function globalSearch(
  userId: string,
  query: string,
  deps: { prisma: PrismaClient }
): Promise<GlobalSearchResults> {
  const q = query.trim();
  if (!q) return { articles: [], highlights: [], tags: [], projects: [] };

  const [articleRows, highlightRows, tagRows, projectRows] = await Promise.all([
    deps.prisma.article.findMany({
      where: { userId, title: { contains: q, mode: 'insensitive' } },
      orderBy: { updatedAt: 'desc' },
      take: LIMIT,
      include: { authors: { orderBy: { position: 'asc' }, include: { author: true } } },
    }),
    deps.prisma.highlight.findMany({
      where: {
        userId,
        OR: [{ excerptText: { contains: q, mode: 'insensitive' } }, { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } }],
      },
      orderBy: { createdAt: 'desc' },
      take: LIMIT,
      include: { article: { select: { id: true, title: true } } },
    }),
    deps.prisma.tag.findMany({
      where: { userId, name: { contains: q, mode: 'insensitive' } },
      take: LIMIT,
      include: { _count: { select: { highlights: true } } },
    }),
    deps.prisma.project.findMany({
      where: { userId, name: { contains: q, mode: 'insensitive' } },
      take: LIMIT,
    }),
  ]);

  return {
    articles: articleRows.map((a) => ({
      id: a.id,
      title: a.title,
      authors: a.authors.map((x) => x.author.name),
      year: a.year,
    })),
    highlights: highlightRows.map((h) => ({
      id: h.id,
      excerptText: h.excerptText,
      color: h.color as HighlightColor,
      page: h.page,
      articleId: h.article.id,
      articleTitle: h.article.title,
    })),
    tags: tagRows.map((t) => ({ id: t.id, name: t.name, highlightCount: t._count.highlights })),
    projects: projectRows.map((p) => ({ id: p.id, name: p.name })),
  };
}
