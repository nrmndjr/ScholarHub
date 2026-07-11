'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FilterBar, type KnowledgeBaseFilterOptions } from './FilterBar';
import { TagSidebar } from './TagSidebar';
import { HighlightResultCard } from './HighlightResultCard';
import { searchHighlightsAction } from '../actions';
import type { HighlightSearchFilters, KnowledgeHighlightCard, TagWithCount } from '@/modules/knowledge-base/domain/entities';

export function KnowledgeBaseWorkspace({
  initialHighlights,
  tags,
  filterOptions,
}: {
  initialHighlights: KnowledgeHighlightCard[];
  tags: TagWithCount[];
  filterOptions: KnowledgeBaseFilterOptions & { tags: { id: string; name: string }[] };
}) {
  const [filters, setFilters] = useState<HighlightSearchFilters>({});
  const [results, setResults] = useState(initialHighlights);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchHighlightsAction(filters);
        setResults(data);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [filters]);

  function toggleTag(tagId: string) {
    setFilters((prev) => {
      const current = prev.tagIds ?? [];
      const next = current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId];
      return { ...prev, tagIds: next.length > 0 ? next : undefined };
    });
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="text-lg font-semibold">Base de Conhecimento</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Todos os trechos que você já destacou, pesquisáveis por assunto, autor ou contexto.
        </p>
        <div className="mt-3">
          <FilterBar filters={filters} onChange={setFilters} options={filterOptions} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800">
          <TagSidebar tags={tags} selectedTagIds={filters.tagIds ?? []} onToggleTag={toggleTag} />
        </div>

        <div className="flex-1 overflow-y-auto p-4" style={{ opacity: isPending ? 0.6 : 1 }}>
          <p className="mb-3 text-xs text-neutral-400">
            {results.length} destaque{results.length === 1 ? '' : 's'} encontrado{results.length === 1 ? '' : 's'}
          </p>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <BookOpen className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
              {Object.values(filters).some((v) => v !== undefined && v !== '') ? (
                <>
                  <p className="text-sm text-neutral-400">Nenhum destaque encontrado com esses filtros.</p>
                  <Button size="sm" variant="secondary" onClick={() => setFilters({})}>
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-400">
                    Nenhum destaque ainda. Abra um artigo na Biblioteca e comece a marcar trechos.
                  </p>
                  <Link href="/library">
                    <Button size="sm">Ir para Biblioteca</Button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((card) => (
                <HighlightResultCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
