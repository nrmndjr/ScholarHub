'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type NodeObject, type LinkObject } from 'react-force-graph-2d';
import { KNOWLEDGE_NODE_TYPE_META, type KnowledgeGraphNode, type KnowledgeGraphEdge } from '@/modules/knowledge-map/domain/entities';

const MANUAL_EDGE_COLOR = '#f59e0b';
const AUTO_EDGE_COLOR_LIGHT = 'rgba(100, 116, 139, 0.35)';
const AUTO_EDGE_COLOR_DARK = 'rgba(148, 163, 184, 0.35)';

export function KnowledgeGraph({
  nodes,
  edges,
  selectedNodeId,
  onNodeClick,
  darkMode,
}: {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  darkMode: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods<KnowledgeGraphNode, KnowledgeGraphEdge> | undefined>(undefined);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // A plain window 'resize' listener misses layout shifts caused by siblings (e.g. the
    // node detail panel mounting/unmounting), which would otherwise leave the canvas at a
    // stale width while its flex container shrinks around it. ResizeObserver reacts to the
    // container's own box changing for any reason.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // The underlying force simulation's "stop" event fires at an unpredictable time
    // (it can take anywhere from a couple seconds to 20+), so instead of trusting a
    // single event, keep re-fitting the view for the first few seconds so whichever
    // moment the layout actually settles at gets framed correctly. Duration must be 0
    // (instant, no tween): an animated zoomToFit relies on the render loop still
    // ticking to advance the transition, but once the simulation cools down that loop
    // stops, so any in-flight tween freezes and the zoom never actually applies.
    let attempts = 0;
    const interval = setInterval(() => {
      graphRef.current?.zoomToFit(0, 60);
      attempts += 1;
      if (attempts >= 30) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [nodes.length]);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ ...n })),
      links: edges.map((e) => ({ ...e, source: e.source, target: e.target })),
    }),
    [nodes, edges]
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        ref={graphRef}
        width={size.width}
        height={size.height}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={4}
        nodeVal={(node: NodeObject<KnowledgeGraphNode>) => Math.sqrt(node.articleCount ?? 1)}
        nodeColor={(node: NodeObject<KnowledgeGraphNode>) =>
          node.id === selectedNodeId ? '#ef4444' : KNOWLEDGE_NODE_TYPE_META[node.type].color
        }
        nodeLabel={(node: NodeObject<KnowledgeGraphNode>) => node.label}
        linkColor={(link: LinkObject<KnowledgeGraphNode, KnowledgeGraphEdge>) =>
          link.origin === 'MANUAL' ? MANUAL_EDGE_COLOR : darkMode ? AUTO_EDGE_COLOR_DARK : AUTO_EDGE_COLOR_LIGHT
        }
        linkLineDash={(link: LinkObject<KnowledgeGraphNode, KnowledgeGraphEdge>) =>
          link.origin === 'MANUAL' ? [2, 2] : null
        }
        linkWidth={(link: LinkObject<KnowledgeGraphNode, KnowledgeGraphEdge>) => (link.origin === 'MANUAL' ? 1.5 : 1)}
        nodeCanvasObject={(node: NodeObject<KnowledgeGraphNode>, ctx, globalScale) => {
          const radius = 3 + Math.sqrt(node.articleCount ?? 1) * 2;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI);
          ctx.fillStyle = node.id === selectedNodeId ? '#ef4444' : KNOWLEDGE_NODE_TYPE_META[node.type].color;
          ctx.fill();

          if (globalScale > 1.2) {
            const fontSize = 11 / globalScale;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = darkMode ? 'rgba(230,230,230,0.9)' : 'rgba(30,30,30,0.9)';
            ctx.fillText(node.label.slice(0, 28), node.x ?? 0, (node.y ?? 0) + radius + 2);
          }
        }}
        onNodeClick={(node: NodeObject<KnowledgeGraphNode>) => onNodeClick(String(node.id))}
        onBackgroundClick={() => onNodeClick('')}
        enableNodeDrag
        cooldownTime={4000}
      />
    </div>
  );
}
