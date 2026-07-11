import { Prisma, type PrismaClient } from '@/generated/prisma/client';
import type { HighlightColor } from '@/modules/highlights/domain/entities';
import { tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';

export interface InsertableHighlight {
  id: string;
  color: HighlightColor;
  page: number;
  excerptText: string;
  tags: string[];
}

export interface InsertableComment {
  id: string;
  page: number | null;
  excerptText: string;
}

export interface InsertableArticle {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  hasSummary: boolean;
  highlights: InsertableHighlight[];
  comments: InsertableComment[];
}

export async function listInsertableContent(
  userId: string,
  search: string | undefined,
  deps: { prisma: PrismaClient }
): Promise<InsertableArticle[]> {
  const articles = await deps.prisma.article.findMany({
    where: {
      userId,
      OR: [{ highlights: { some: {} } }, { comments: { some: {} } }, { summaryContent: { not: Prisma.DbNull } }],
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: {
      authors: { orderBy: { position: 'asc' }, include: { author: true } },
      highlights: { orderBy: { createdAt: 'asc' }, include: { tags: { include: { tag: true } } } },
      comments: { orderBy: { createdAt: 'asc' }, include: { highlight: true } },
    },
  });

  const mapped = articles
    .filter((a) => a.highlights.length > 0 || a.comments.length > 0 || a.summaryContent)
    .map((a) => ({
      id: a.id,
      title: a.title,
      authors: a.authors.map((x) => x.author.name),
      year: a.year,
      hasSummary: !!a.summaryContent && tiptapToPlainText(a.summaryContent).length > 0,
      highlights: a.highlights.map((h) => ({
        id: h.id,
        color: h.color as HighlightColor,
        page: h.page,
        excerptText: h.excerptText,
        tags: h.tags.map((t) => t.tag.name),
      })),
      comments: a.comments.map((c) => ({
        id: c.id,
        page: c.highlight?.page ?? null,
        excerptText: tiptapToPlainText(c.body),
      })),
    }));

  const query = search?.trim().toLowerCase();
  if (!query) return mapped.slice(0, 40);

  // Search across article title/authors, and per-article highlight excerpt/tags/comment text —
  // this lets a Painel de Escrita search like "Letramento Crítico" surface every highlight
  // tagged with that theme, not just articles whose title happens to match.
  return mapped
    .map((article) => {
      const articleMatches =
        article.title.toLowerCase().includes(query) || article.authors.some((a) => a.toLowerCase().includes(query));

      const highlights = articleMatches
        ? article.highlights
        : article.highlights.filter(
            (h) =>
              h.excerptText.toLowerCase().includes(query) || h.tags.some((t) => t.toLowerCase().includes(query))
          );

      const comments = articleMatches
        ? article.comments
        : article.comments.filter((c) => c.excerptText.toLowerCase().includes(query));

      if (!articleMatches && highlights.length === 0 && comments.length === 0) return null;

      return { ...article, highlights, comments };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
}
