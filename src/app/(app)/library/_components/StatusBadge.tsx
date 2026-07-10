'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { ARTICLE_STATUSES, ARTICLE_STATUS_LABELS, type ArticleStatus } from '@/modules/articles/domain/entities';
import { changeStatusAction } from '../actions';

const STATUS_CLASSES: Record<ArticleStatus, string> = {
  NAO_INICIADO: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  LENDO: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  CONCLUIDO: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  ABANDONADO: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export function StatusBadge({ articleId, status }: { articleId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(async () => {
          await changeStatusAction(articleId, value);
          router.refresh();
        });
      }}
      className={cn(
        'cursor-pointer rounded-full border-0 px-2 py-0.5 text-xs font-medium outline-none',
        STATUS_CLASSES[status as ArticleStatus] ?? STATUS_CLASSES.NAO_INICIADO
      )}
    >
      {ARTICLE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ARTICLE_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
