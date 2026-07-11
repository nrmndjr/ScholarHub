'use client';

import Link from 'next/link';
import { ExternalLink, Copy, Quote } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { formatArticleAbnt } from '@/modules/reference-formatting/abnt';
import type { KnowledgeHighlightCard } from '@/modules/knowledge-base/domain/entities';

export function HighlightResultCard({ card }: { card: KnowledgeHighlightCard }) {
  const meta = HIGHLIGHT_COLOR_META[card.color as HighlightColor];

  function handleCopyExcerpt() {
    navigator.clipboard.writeText(card.excerptText);
    toast.success('Trecho copiado');
  }

  function handleCopyAbnt() {
    const reference = formatArticleAbnt({
      title: card.article.title,
      authors: card.article.authors,
      journalName: card.article.journalName,
      year: card.article.year,
      volume: card.article.volume,
      issue: card.article.issue,
      pages: card.article.pages,
      doi: card.article.doi,
      url: card.article.url,
    });
    navigator.clipboard.writeText(reference.plainText);
    toast.success('Referência ABNT copiada');
  }

  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
          style={{ backgroundColor: meta.cssVar }}
        >
          {meta.emoji} {meta.label}
        </span>
        <span className="text-xs text-neutral-400">p. {card.page}</span>
      </div>

      <p className="line-clamp-4 text-sm text-neutral-700 dark:text-neutral-300">&ldquo;{card.excerptText}&rdquo;</p>

      {card.commentText && (
        <p className="line-clamp-2 border-l-2 border-neutral-200 pl-2 text-xs italic text-neutral-500 dark:border-neutral-700">
          {card.commentText}
        </p>
      )}

      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        <p className="truncate font-medium text-neutral-700 dark:text-neutral-300">{card.article.title}</p>
        <p className="truncate">
          {card.article.authors.length > 0 ? card.article.authors.join(', ') : 'Autor desconhecido'}
          {card.article.year ? ` · ${card.article.year}` : ''}
        </p>
        {card.projects.length > 0 && <p className="truncate">{card.projects.join(', ')}</p>}
      </div>

      <div className="mt-1 flex items-center gap-3 border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
        <Link
          href={`/article/${card.article.id}?page=${card.page}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Abrir PDF
        </Link>
        <button
          type="button"
          onClick={handleCopyExcerpt}
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <Copy className="h-3.5 w-3.5" />
          Copiar trecho
        </button>
        <button
          type="button"
          onClick={handleCopyAbnt}
          className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <Quote className="h-3.5 w-3.5" />
          Copiar ABNT
        </button>
      </div>
    </Card>
  );
}
