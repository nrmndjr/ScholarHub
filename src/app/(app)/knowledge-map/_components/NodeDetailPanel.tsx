'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { ARTICLE_STATUS_LABELS, type ArticleStatus } from '@/modules/articles/domain/entities';
import {
  KNOWLEDGE_NODE_TYPE_META,
  MANUAL_CONNECTION_LABELS,
  type KnowledgeGraphNode,
  type KnowledgeGraphEdge,
  type ManualConnectionType,
} from '@/modules/knowledge-map/domain/entities';
import { ManualConnectionsSection } from './ManualConnectionsSection';

export function NodeDetailPanel({
  node,
  nodesById,
  edges,
  onClose,
}: {
  node: KnowledgeGraphNode;
  nodesById: Map<string, KnowledgeGraphNode>;
  edges: KnowledgeGraphEdge[];
  onClose: () => void;
}) {
  const relatedEdges = edges.filter((e) => e.source === node.id || e.target === node.id);

  const relatedByType = new Map<string, { node: KnowledgeGraphNode; edge: KnowledgeGraphEdge }[]>();
  const manualConnections: {
    edgeId: string;
    otherArticleRefId: string;
    otherLabel: string;
    connectionType: ManualConnectionType;
    note?: string | null;
  }[] = [];

  for (const edge of relatedEdges) {
    const otherId = edge.source === node.id ? edge.target : edge.source;
    const otherNode = nodesById.get(otherId);
    if (!otherNode) continue;

    if (edge.origin === 'MANUAL' && node.type === 'article') {
      manualConnections.push({
        edgeId: edge.id,
        otherArticleRefId: otherNode.refId,
        otherLabel: otherNode.label,
        connectionType: edge.kind as ManualConnectionType,
        note: edge.note,
      });
      continue;
    }

    const list = relatedByType.get(otherNode.type) ?? [];
    list.push({ node: otherNode, edge });
    relatedByType.set(otherNode.type, list);
  }

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-200 p-3 dark:border-neutral-800">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: KNOWLEDGE_NODE_TYPE_META[node.type].color }}
        >
          {KNOWLEDGE_NODE_TYPE_META[node.type].label.replace(/s$/, '')}
        </span>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        <div>
          <h3 className="text-sm font-semibold">{node.label}</h3>
          {node.type === 'article' && node.meta && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {node.meta.year ? `${node.meta.year} · ` : ''}
              {ARTICLE_STATUS_LABELS[node.meta.status as ArticleStatus] ?? node.meta.status}
            </p>
          )}
          {node.type === 'article' && (
            <Link href={`/article/${node.refId}`} className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
              Abrir artigo →
            </Link>
          )}
        </div>

        {node.type === 'article' && (
          <ManualConnectionsSection articleId={node.refId} articleLabel={node.label} connections={manualConnections} />
        )}

        {Array.from(relatedByType.entries()).map(([type, items]) => (
          <div key={type}>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              {KNOWLEDGE_NODE_TYPE_META[type as keyof typeof KNOWLEDGE_NODE_TYPE_META].label}
            </h4>
            <ul className="space-y-1">
              {items.map(({ node: relatedNode, edge }) => (
                <li key={relatedNode.id + edge.id} className="text-xs">
                  {relatedNode.type === 'article' ? (
                    <Link href={`/article/${relatedNode.refId}`} className="text-neutral-600 hover:text-accent hover:underline dark:text-neutral-300">
                      {relatedNode.label}
                    </Link>
                  ) : (
                    <span className="text-neutral-600 dark:text-neutral-300">{relatedNode.label}</span>
                  )}
                  {edge.origin === 'MANUAL' && (
                    <span className="ml-1 text-amber-500">({MANUAL_CONNECTION_LABELS[edge.kind as ManualConnectionType]})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {relatedByType.size === 0 && manualConnections.length === 0 && (
          <p className="text-xs text-neutral-400">Nenhuma conexão encontrada.</p>
        )}
      </div>
    </div>
  );
}
