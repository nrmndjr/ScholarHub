import { Card } from '@/components/ui/Card';
import { History } from 'lucide-react';
import type { TimelineGroup } from '@/modules/engagement/domain/entities';

export function ActivityTimeline({ groups }: { groups: TimelineGroup[] }) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold">Linha do Tempo</h2>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <History className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm text-neutral-400">Sua atividade recente aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.heading}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-400">{group.heading}</p>
              <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
                {group.entries.map((entry, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {entry.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
