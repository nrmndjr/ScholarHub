export const ARTICLE_STAGES = ['INBOX', 'LIBRARY'] as const;
export type ArticleStage = (typeof ARTICLE_STAGES)[number];

export const ARTICLE_STATUSES = ['NAO_INICIADO', 'LENDO', 'CONCLUIDO', 'ABANDONADO'] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_STATUS_LABELS: Record<ArticleStatus, string> = {
  NAO_INICIADO: 'Não iniciado',
  LENDO: 'Lendo',
  CONCLUIDO: 'Concluído',
  ABANDONADO: 'Abandonado',
};

export const PROCESSING_JOB_TYPES = ['EXTRACT_METADATA', 'CROSSREF_LOOKUP'] as const;
export type ProcessingJobType = (typeof PROCESSING_JOB_TYPES)[number];

export const PROCESSING_JOB_STATUSES = ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'] as const;
export type ProcessingJobStatus = (typeof PROCESSING_JOB_STATUSES)[number];

export interface ExtractedMetadata {
  title?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  journal?: string;
  abstractText?: string;
  keywords?: string[];
}

const COMPLETENESS_FIELDS: Array<{ key: keyof ExtractedMetadata; weight: number }> = [
  { key: 'title', weight: 25 },
  { key: 'authors', weight: 20 },
  { key: 'year', weight: 10 },
  { key: 'doi', weight: 10 },
  { key: 'journal', weight: 15 },
  { key: 'abstractText', weight: 15 },
  { key: 'keywords', weight: 5 },
];

export function calculateCompletenessScore(metadata: ExtractedMetadata): number {
  let score = 0;
  for (const field of COMPLETENESS_FIELDS) {
    const value = metadata[field.key];
    const filled = Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && value !== '';
    if (filled) score += field.weight;
  }
  return score;
}
