import type { HighlightColor } from '@/modules/highlights/domain/entities';
import type { ArticleStatus } from '@/modules/articles/domain/entities';

export interface HighlightSearchFilters {
  query?: string;
  authorId?: string;
  journalId?: string;
  projectId?: string;
  folderId?: string;
  tagIds?: string[];
  color?: HighlightColor;
  articleStatus?: ArticleStatus;
  yearFrom?: number;
  yearTo?: number;
  dateFrom?: string; // highlight createdAt, ISO date
  dateTo?: string;
}

export interface KnowledgeHighlightCard {
  id: string;
  excerptText: string;
  color: HighlightColor;
  page: number;
  commentText: string | null;
  createdAt: string;
  tags: { id: string; name: string }[];
  article: {
    id: string;
    title: string;
    authors: string[];
    year: number | null;
    journalName: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    doi: string | null;
    url: string | null;
    status: ArticleStatus;
  };
  projects: string[];
  folder: string | null;
}

export interface TagWithCount {
  id: string;
  name: string;
  color: string | null;
  highlightCount: number;
}
