import type { HighlightColor, HighlightPositionData } from '@/modules/highlights/domain/entities';

export interface HighlightItem {
  id: string;
  color: HighlightColor;
  page: number;
  excerptText: string;
  positionData: HighlightPositionData;
  createdAt: string;
  comment: { id: string; body: unknown } | null;
}

export interface CommentItem {
  id: string;
  body: unknown;
  createdAt: string;
  highlightId: string | null;
  highlightColor: HighlightColor | null;
  highlightPage: number | null;
  highlightExcerpt: string | null;
}

export interface ArticleData {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url: string | null;
  currentPage: number;
  totalPages: number | null;
  summaryContent: unknown;
  fileUrl: string;
}
