import Link from 'next/link';
import { Highlighter, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CompletenessBadge } from '@/components/ui/CompletenessBadge';
import { StatusBadge } from './StatusBadge';
import { FavoriteButton } from './FavoriteButton';
import { DeleteArticleButton } from './DeleteArticleButton';
import type { LibraryArticleItem } from './types';

export function LibraryListView({
  items,
  selectedIds,
  onToggleSelect,
}: {
  items: LibraryArticleItem[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link key={item.id} href={`/article/${item.id}`}>
          <Card className="flex items-center gap-4 p-3 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onClick={(e) => e.stopPropagation()}
              onChange={() => onToggleSelect(item.id)}
              className="h-3.5 w-3.5 shrink-0"
              aria-label={`Selecionar "${item.title}"`}
            />
            <FavoriteButton articleId={item.id} favorite={item.favorite} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {item.authors.join(', ') || 'Sem autores'}
                {item.year ? ` · ${item.year}` : ''}
                {item.journal ? ` · ${item.journal}` : ''}
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-3 text-xs text-neutral-400 sm:flex">
              <span className="inline-flex items-center gap-1">
                <Highlighter className="h-3.5 w-3.5" />
                {item.highlightsCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {item.commentsCount}
              </span>
            </div>

            {item.completenessScore < 100 && <CompletenessBadge score={item.completenessScore} />}
            <StatusBadge articleId={item.id} status={item.status} />
            <DeleteArticleButton articleId={item.id} title={item.title} />
          </Card>
        </Link>
      ))}
    </div>
  );
}
