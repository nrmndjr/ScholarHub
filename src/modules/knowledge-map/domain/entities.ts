export const KNOWLEDGE_NODE_TYPES = ['article', 'author', 'project', 'tag', 'journal', 'keyword'] as const;
export type KnowledgeNodeType = (typeof KNOWLEDGE_NODE_TYPES)[number];

export const KNOWLEDGE_NODE_TYPE_META: Record<KnowledgeNodeType, { label: string; color: string }> = {
  article: { label: 'Artigos', color: '#6366f1' },
  author: { label: 'Autores', color: '#f59e0b' },
  project: { label: 'Projetos', color: '#0ea5e9' },
  tag: { label: 'Tags', color: '#22c55e' },
  journal: { label: 'Periódicos', color: '#ec4899' },
  keyword: { label: 'Palavras-chave', color: '#a855f7' },
};

export const MANUAL_CONNECTION_TYPES = [
  'COMPLEMENTA',
  'CONTRADIZ',
  'APROFUNDA',
  'BASE_TEORICA',
  'METODOLOGIA_SEMELHANTE',
  'MESMO_ESTUDO_DE_CASO',
] as const;
export type ManualConnectionType = (typeof MANUAL_CONNECTION_TYPES)[number];

export const MANUAL_CONNECTION_LABELS: Record<ManualConnectionType, string> = {
  COMPLEMENTA: 'Complementa',
  CONTRADIZ: 'Contradiz',
  APROFUNDA: 'Aprofunda',
  BASE_TEORICA: 'Base teórica',
  METODOLOGIA_SEMELHANTE: 'Metodologia semelhante',
  MESMO_ESTUDO_DE_CASO: 'Mesmo estudo de caso',
};

export type EdgeOrigin = 'AUTO' | 'MANUAL';

export type AutoEdgeKind = 'author' | 'project' | 'tag' | 'journal' | 'keyword' | 'year' | 'citation';

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  refId: string;
  articleCount?: number;
  meta?: {
    year?: number | null;
    status?: string | null;
    favorite?: boolean;
  };
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  origin: EdgeOrigin;
  kind: AutoEdgeKind | ManualConnectionType;
  note?: string | null;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}
