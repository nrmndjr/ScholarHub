import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import { searchHighlights } from './search-highlights';
import type { KnowledgeHighlightCard } from '../domain/entities';

export interface TagDetail {
  id: string;
  name: string;
  highlights: KnowledgeHighlightCard[];
  articleCount: number;
  topAuthors: { name: string; count: number }[];
  projects: string[];
  journals: string[];
  yearTimeline: { year: number; count: number }[];
}

export async function getTagDetail(tagId: string, userId: string, deps: { prisma: PrismaClient }): Promise<TagDetail> {
  const tag = await deps.prisma.tag.findFirst({ where: { id: tagId, userId } });
  if (!tag) throw new NotFoundError('Tag não encontrada');

  const highlights = await searchHighlights(userId, { tagIds: [tagId] }, deps);

  const articleIds = new Set(highlights.map((h) => h.article.id));

  const authorCounts = new Map<string, number>();
  const projectSet = new Set<string>();
  const journalSet = new Set<string>();
  const yearCounts = new Map<number, number>();
  const seenArticleForYear = new Set<string>();

  for (const h of highlights) {
    for (const author of h.article.authors) {
      authorCounts.set(author, (authorCounts.get(author) ?? 0) + 1);
    }
    for (const project of h.projects) projectSet.add(project);
    if (h.article.journalName) journalSet.add(h.article.journalName);
    if (h.article.year && !seenArticleForYear.has(h.article.id)) {
      seenArticleForYear.add(h.article.id);
      yearCounts.set(h.article.year, (yearCounts.get(h.article.year) ?? 0) + 1);
    }
  }

  const topAuthors = Array.from(authorCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const yearTimeline = Array.from(yearCounts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  return {
    id: tag.id,
    name: tag.name,
    highlights,
    articleCount: articleIds.size,
    topAuthors,
    projects: Array.from(projectSet).sort(),
    journals: Array.from(journalSet).sort(),
    yearTimeline,
  };
}
