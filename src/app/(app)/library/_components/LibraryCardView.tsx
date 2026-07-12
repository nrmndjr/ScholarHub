import Link from 'next/link';
import { Highlighter, MessageSquare, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CompletenessBadge } from '@/components/ui/CompletenessBadge';
import { StatusBadge } from './StatusBadge';
import { FavoriteButton } from './FavoriteButton';
import { DeleteArticleButton } from './DeleteArticleButton';
import type { LibraryArticleItem } from './types';

export function LibraryCardView({
  items,
  selectedIds,
  onToggleSelect,
}: {
  items: LibraryArticleItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={`/article/${item.id}`}>
          <Card className="flex h-full flex-col gap-3 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => onToggleSelect(item.id)}
                  className="mr-0.5 h-3.5 w-3.5 shrink-0"
                  aria-label={`Selecionar "${item.title}"`}
                />
                <StatusBadge articleId={item.id} status={item.status} />
                {item.completenessScore < 100 && <CompletenessBadge score={item.completenessScore} />}
              </div>
              <div className="flex items-center gap-0.5">
                <FavoriteButton articleId={item.id} favorite={item.favorite} />
                <DeleteArticleButton articleId={item.id} title={item.title} />
              </div>
            </div>

            <div>
              <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
              <p className="mt-1 line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                {item.authors.join(', ') || 'Sem autores'}
                {item.year ? ` · ${item.year}` : ''}
              </p>
              {item.journal && <p className="mt-0.5 line-clamp-1 text-xs italic text-neutral-400">{item.journal}</p>}
            </div>

            {item.progress != null && (
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full bg-accent" style={{ width: `${Math.round(item.progress * 100)}%` }} />
              </div>
            )}

            {(item.tags.length > 0 || item.projects.length > 0) && (
              <div className="flex flex-wrap gap-1">
                {item.projects.map((p) => (
                  <Badge key={p} variant="accent">
                    {p}
                  </Badge>
                ))}
                {item.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1">
                <Highlighter className="h-3.5 w-3.5" />
                {item.highlightsCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {item.commentsCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {item.readingTimeLabel}
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
