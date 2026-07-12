import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { JOURNEY_STAGES } from '@/modules/engagement/domain/entities';
import type { JourneyStatus } from '@/modules/engagement/domain/entities';

export function JourneyPanel({ journey }: { journey: JourneyStatus }) {
  const currentIndex = JOURNEY_STAGES.findIndex((s) => s.key === journey.stage.key);

  return (
    <Card className="p-4">
      <h2 className="mb-1 text-sm font-semibold">Jornada do Pesquisador</h2>
      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">{journey.stage.description}</p>

      <div className="space-y-2.5">
        {JOURNEY_STAGES.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          return (
            <div key={stage.key} className="flex items-center gap-2.5">
              <div
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  isCurrent ? 'bg-accent' : isPast ? 'bg-accent/40' : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
              <span
                className={cn(
                  'text-sm',
                  isCurrent
                    ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                    : isPast
                      ? 'text-neutral-500 dark:text-neutral-400'
                      : 'text-neutral-400 dark:text-neutral-600'
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {journey.nextStage && journey.pointsToNextStage != null && (
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          {`${journey.pointsToNextStage} ponto${journey.pointsToNextStage === 1 ? '' : 's'} para chegar a “${journey.nextStage.label}”.`}
        </p>
      )}
    </Card>
  );
}
