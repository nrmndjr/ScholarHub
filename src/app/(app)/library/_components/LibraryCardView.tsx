import Link from 'next/link';
import { Highlighter, MessageSquare, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from './StatusBadge';
import { FavoriteButton } from './FavoriteButton';
import type { LibraryArticleItem } from './types';

export function LibraryCardView({ items }: { items: LibraryArticleItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={`/article/${item.id}`}>
          <Card className="flex h-full flex-col gap-3 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
            <div className="flex items-start justify-between gap-2">
              <StatusBadge articleId={item.id} status={item.status} />
              <FavoriteButton articleId={item.id} favorite={item.favorite} />
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
