import { cn } from '@/lib/utils';

export function CompletenessBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300'
      : score >= 40
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
        : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';

  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', tone)}>
      {score}% completo
    </span>
  );
}
