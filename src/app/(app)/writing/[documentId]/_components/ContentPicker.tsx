'use client';

import { useEffect, useState, useTransition } from 'react';
import { ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import type { InsertableArticle } from '@/modules/writing/use-cases/list-insertable-content';
import { DraggablePickerItem } from './DraggablePickerItem';
import { searchInsertableContentAction } from '../actions';

function ArticleGroup({ article }: { article: InsertableArticle }) {
  const [open, setOpen] = useState(false);
  const total = article.highlights.length + article.comments.length + (article.hasSummary ? 1 : 0) + 1;

  return (
    <div className="border-b border-neutral-100 py-2 last:border-none dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 text-left text-xs font-medium"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        <span className="truncate">{article.title}</span>
        <span className="ml-auto shrink-0 text-neutral-400">{total}</span>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 pl-5">
          <DraggablePickerItem id={`picker|CITATION_REF|-|${article.id}`}>
            📚 Citação (ABNT)
          </DraggablePickerItem>

          {article.hasSummary && (
            <DraggablePickerItem id={`picker|SUMMARY_REF|-|${article.id}`}>📝 Resumo pessoal</DraggablePickerItem>
          )}

          {article.highlights.map((h) => {
            const meta = HIGHLIGHT_COLOR_META[h.color as HighlightColor];
            return (
              <DraggablePickerItem key={h.id} id={`picker|HIGHLIGHT_REF|${h.id}|${article.id}`}>
                <span className="line-clamp-2">
                  {meta.emoji} {h.excerptText}
                </span>
              </DraggablePickerItem>
            );
          })}

          {article.comments.map((c) => (
            <DraggablePickerItem key={c.id} id={`picker|COMMENT_REF|${c.id}|${article.id}`}>
              <span className="line-clamp-2">💬 {c.excerptText}</span>
            </DraggablePickerItem>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContentPicker({ initial }: { initial: InsertableArticle[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(initial);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchInsertableContentAction(query);
        setResults(data);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
        <h2 className="mb-2 text-sm font-semibold">Suas leituras</h2>
        <div className="relative">
          {isPending ? (
            <Loader2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-neutral-400" />
          ) : (
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          )}
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artigo..."
            className="h-8 pl-8 text-xs"
          />
        </div>
        <p className="mt-1.5 text-[11px] text-neutral-400">Arraste um item para o documento.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3" style={{ opacity: isPending ? 0.6 : 1 }}>
        {results.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-400">Nenhum conteúdo encontrado.</p>
        ) : (
          results.map((article) => <ArticleGroup key={article.id} article={article} />)
        )}
      </div>
    </div>
  );
}
