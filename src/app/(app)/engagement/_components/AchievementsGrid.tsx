import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { BadgeStatus } from '@/modules/engagement/domain/entities';

function formatUnlockedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AchievementsGrid({ badges }: { badges: BadgeStatus[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Conquistas</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((badge) => (
          <Card
            key={badge.key}
            className={cn('flex flex-col gap-1.5 p-3', !badge.unlocked && 'opacity-70')}
          >
            <div className="flex items-center gap-2">
              <span className={cn('text-xl', !badge.unlocked && 'grayscale')}>{badge.emoji}</span>
              <p className="truncate text-sm font-medium">{badge.label}</p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{badge.description}</p>

            {badge.unlocked && badge.unlockedAt ? (
              <p className="mt-auto text-[11px] font-medium text-accent">
                Conquistado em {formatUnlockedDate(badge.unlockedAt)}
              </p>
            ) : (
              <div className="mt-auto space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div className="h-full bg-accent/60 transition-all" style={{ width: `${badge.percent}%` }} />
                </div>
                <p className="text-[11px] text-neutral-400">
                  {badge.progress}/{badge.threshold} · {badge.percent}%
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
