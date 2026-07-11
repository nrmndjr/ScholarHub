'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TagWithCount } from '@/modules/knowledge-base/domain/entities';

export function TagSidebar({
  tags,
  selectedTagIds,
  onToggleTag,
}: {
  tags: TagWithCount[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}) {
  const selected = new Set(selectedTagIds);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">Eixos temáticos</h2>
        <p className="mt-0.5 text-[11px] text-neutral-400">Clique para filtrar os resultados.</p>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {tags.length === 0 ? (
          <p className="p-2 text-xs text-neutral-400">Nenhuma tag usada em destaques ainda.</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className={cn(
                'group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm',
                selected.has(tag.id)
                  ? 'bg-accent/10 text-accent'
                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900'
              )}
            >
              <button type="button" onClick={() => onToggleTag(tag.id)} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left">
                <span className="truncate">{tag.name}</span>
                <span className="shrink-0 text-xs text-neutral-400">{tag.highlightCount}</span>
              </button>
              <Link
                href={`/knowledge-base/tags/${tag.id}`}
                title="Ver eixo temático completo"
                className="shrink-0 rounded p-0.5 text-neutral-300 opacity-0 hover:text-accent group-hover:opacity-100"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
