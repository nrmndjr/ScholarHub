export interface LibraryArticleItem {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  projects: string[];
  folder: string | null;
  tags: string[];
  favorite: boolean;
  status: string;
  progress: number | null;
  lastOpenedAt: string | null;
  highlightsCount: number;
  commentsCount: number;
  readingTimeLabel: string;
  createdAt: string;
}
