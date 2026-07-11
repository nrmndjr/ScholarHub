import type { Prisma, PrismaClient } from '@/generated/prisma/client';
import { tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';
import type { ArticleStatus } from '@/modules/articles/domain/entities';
import type { HighlightColor } from '@/modules/highlights/domain/entities';
import type { HighlightSearchFilters, KnowledgeHighlightCard } from '../domain/entities';

export async function searchHighlights(
  userId: string,
  filters: HighlightSearchFilters,
  deps: { prisma: PrismaClient }
): Promise<KnowledgeHighlightCard[]> {
  const where: Prisma.HighlightWhereInput = { userId };

  if (filters.color) where.color = filters.color;
  if (filters.tagIds && filters.tagIds.length > 0) {
    where.tags = { some: { tagId: { in: filters.tagIds } } };
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {
      ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
      ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59`) } : {}),
    };
  }

  const articleWhere: Prisma.ArticleWhereInput = {};
  if (filters.authorId) articleWhere.authors = { some: { authorId: filters.authorId } };
  if (filters.journalId) articleWhere.journalId = filters.journalId;
  if (filters.projectId) articleWhere.projects = { some: { projectId: filters.projectId } };
  if (filters.folderId) articleWhere.folderId = filters.folderId;
  if (filters.articleStatus) articleWhere.status = filters.articleStatus;
  if (filters.yearFrom || filters.yearTo) {
    articleWhere.year = {
      ...(filters.yearFrom ? { gte: filters.yearFrom } : {}),
      ...(filters.yearTo ? { lte: filters.yearTo } : {}),
    };
  }
  if (Object.keys(articleWhere).length > 0) where.article = articleWhere;

  const rows = await deps.prisma.highlight.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      tags: { include: { tag: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 1 },
      article: {
        include: {
          authors: { orderBy: { position: 'asc' }, include: { author: true } },
          journal: true,
          projects: { include: { project: true } },
          folder: true,
        },
      },
    },
  });

  const cards: KnowledgeHighlightCard[] = rows.map((h) => ({
    id: h.id,
    excerptText: h.excerptText,
    color: h.color as HighlightColor,
    page: h.page,
    commentText: h.comments[0] ? tiptapToPlainText(h.comments[0].body) : null,
    createdAt: h.createdAt.toISOString(),
    tags: h.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    article: {
      id: h.article.id,
      title: h.article.title,
      authors: h.article.authors.map((a) => a.author.name),
      year: h.article.year,
      journalName: h.article.journal?.name ?? null,
      volume: h.article.volume,
      issue: h.article.issue,
      pages: h.article.pages,
      doi: h.article.doi,
      url: h.article.url,
      status: h.article.status as ArticleStatus,
    },
    projects: h.article.projects.map((p) => p.project.name),
    folder: h.article.folder?.name ?? null,
  }));

  const query = filters.query?.trim().toLowerCase();
  if (!query) return cards;

  return cards.filter((card) => {
    const haystack = [
      card.excerptText,
      card.commentText ?? '',
      card.article.title,
      ...card.article.authors,
      card.article.journalName ?? '',
      ...card.tags.map((t) => t.name),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}
