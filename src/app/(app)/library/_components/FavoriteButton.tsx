'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavoriteAction } from '../actions';

export function FavoriteButton({ articleId, favorite }: { articleId: string; favorite: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        startTransition(async () => {
          await toggleFavoriteAction(articleId);
          router.refresh();
        });
      }}
      className="shrink-0 rounded-md p-1 text-neutral-300 transition-colors hover:text-amber-400 dark:text-neutral-600"
      aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Star className={cn('h-4 w-4', favorite && 'fill-amber-400 text-amber-400')} />
    </button>
  );
}
