import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ContinueReading({
  items,
}: {
  items: Array<{ id: string; title: string; authors: string[]; progress: number | null }>;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold">Continue lendo</h2>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <BookOpen className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
          <p className="text-xs text-neutral-400">Nenhum artigo aberto ainda.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={`/article/${item.id}`} className="group block">
                <p className="truncate text-sm font-medium group-hover:text-accent">{item.title}</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {item.authors.length > 0 ? item.authors.join(', ') : 'Autor desconhecido'}
                </p>
                {item.progress !== null && (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.round(item.progress * 100)}%` }}
                    />
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
