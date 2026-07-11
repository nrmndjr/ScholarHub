import { Prisma, type PrismaClient } from '@/generated/prisma/client';
import type { HighlightColor } from '@/modules/highlights/domain/entities';
import { tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';

export interface InsertableHighlight {
  id: string;
  color: HighlightColor;
  page: number;
  excerptText: string;
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
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      OR: search
        ? undefined
        : [{ highlights: { some: {} } }, { comments: { some: {} } }, { summaryContent: { not: Prisma.DbNull } }],
    },
    orderBy: { updatedAt: 'desc' },
    take: 40,
    include: {
      authors: { orderBy: { position: 'asc' }, include: { author: true } },
      highlights: { orderBy: { createdAt: 'asc' } },
      comments: { orderBy: { createdAt: 'asc' }, include: { highlight: true } },
    },
  });

  return articles
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
      })),
      comments: a.comments.map((c) => ({
        id: c.id,
        page: c.highlight?.page ?? null,
        excerptText: tiptapToPlainText(c.body),
      })),
    }));
}
