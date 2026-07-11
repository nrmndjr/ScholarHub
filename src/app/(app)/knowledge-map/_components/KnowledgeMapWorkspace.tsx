'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Network } from 'lucide-react';
import {
  KNOWLEDGE_NODE_TYPES,
  KNOWLEDGE_NODE_TYPE_META,
  type KnowledgeGraphData,
  type KnowledgeNodeType,
} from '@/modules/knowledge-map/domain/entities';
import { NodeDetailPanel } from './NodeDetailPanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph').then((m) => m.KnowledgeGraph), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-neutral-400">Carregando mapa...</div>,
});

export function KnowledgeMapWorkspace({ graph }: { graph: KnowledgeGraphData }) {
  const [visibleTypes, setVisibleTypes] = useState<Set<KnowledgeNodeType>>(new Set(KNOWLEDGE_NODE_TYPES));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes]);

  const filteredNodes = useMemo(
    () => graph.nodes.filter((n) => visibleTypes.has(n.type)),
    [graph.nodes, visibleTypes]
  );
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(
    () => graph.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
    [graph.edges, filteredNodeIds]
  );

  const selectedNode = selectedNodeId ? (nodesById.get(selectedNodeId) ?? null) : null;

  function toggleType(type: KnowledgeNodeType) {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <Network className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
        <h1 className="text-lg font-semibold">Mapa do Conhecimento</h1>
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          Arquive artigos na Biblioteca para começar a ver as conexões entre autores, projetos, tags, periódicos e
          palavras-chave.
        </p>
        <Link href="/library">
          <Button size="sm">Ir para Biblioteca</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-950">
        <span className="text-sm font-semibold">Mapa do Conhecimento</span>
        <div className="ml-4 flex flex-wrap gap-1.5">
          {KNOWLEDGE_NODE_TYPES.map((type) => {
            const meta = KNOWLEDGE_NODE_TYPE_META[type];
            const active = visibleTypes.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-opacity',
                  active ? 'border-transparent text-white' : 'border-neutral-300 text-neutral-400 opacity-50 dark:border-neutral-700'
                )}
                style={active ? { backgroundColor: meta.color } : undefined}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-xs text-neutral-400">
          {filteredNodes.length} nós · {filteredEdges.length} conexões
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1">
          <KnowledgeGraph
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedNodeId={selectedNodeId}
            onNodeClick={(id) => setSelectedNodeId(id || null)}
            darkMode={darkMode}
          />
        </div>

        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            nodesById={nodesById}
            edges={graph.edges}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  );
}
