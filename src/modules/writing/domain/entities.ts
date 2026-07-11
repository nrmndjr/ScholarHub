export const WRITING_BLOCK_TYPES = ['TEXT', 'HIGHLIGHT_REF', 'COMMENT_REF', 'SUMMARY_REF', 'CITATION_REF'] as const;
export type WritingBlockType = (typeof WRITING_BLOCK_TYPES)[number];

export const WRITING_BLOCK_TYPE_LABELS: Record<WritingBlockType, string> = {
  TEXT: 'Texto livre',
  HIGHLIGHT_REF: 'Destaque',
  COMMENT_REF: 'Comentário',
  SUMMARY_REF: 'Resumo pessoal',
  CITATION_REF: 'Citação',
};

// Suggested starting titles shown when creating a new document — the user can
// always type something else instead, this is just a shortcut for the common cases.
export const WRITING_DOCUMENT_TITLE_SUGGESTIONS = [
  'Fundamentação Teórica',
  'Revisão de Literatura',
  'Metodologia',
  'Discussão',
  'Capítulo 2',
  'Artigo para Congresso',
  'Anotações Gerais',
] as const;

export interface WritingBlockSourceMeta {
  articleId: string;
  articleTitle: string;
  authors: string[];
  year: number | null;
  projects: string[];
  page: number | null;
}

export interface WritingBlockData {
  id: string;
  order: number;
  blockType: WritingBlockType;
  textContent: string | null;
  source: WritingBlockSourceMeta | null;
  highlightColor: string | null;
  excerptText: string | null;
  commentText: string | null;
  summaryText: string | null;
  citationPlainText: string | null;
}

export interface WritingDocumentSummary {
  id: string;
  title: string;
  projectId: string | null;
  projectName: string | null;
  blockCount: number;
  updatedAt: string;
}
