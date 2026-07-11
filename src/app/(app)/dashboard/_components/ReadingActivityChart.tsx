'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.getDate();
}

function formatFullDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function ReadingActivityChart({ data }: { data: Array<{ date: string; minutes: number }> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.minutes));
  const hoveredEntry = data.find((d) => d.date === hovered);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Atividade de leitura</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {hoveredEntry
            ? `${hoveredEntry.minutes} min · ${formatFullDate(hoveredEntry.date)}`
            : 'Últimos 14 dias (minutos por dia)'}
        </p>
      </div>

      <div className="flex h-28 gap-1">
        {data.map((d) => {
          const heightPct = d.minutes === 0 ? 0 : Math.max(4, (d.minutes / max) * 100);
          return (
            <div
              key={d.date}
              className="group relative flex flex-1 flex-col justify-end"
              onMouseEnter={() => setHovered(d.date)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                style={{ height: `${heightPct}%` }}
                className={
                  'mx-auto w-full max-w-4 rounded-t-sm transition-colors ' +
                  (d.minutes === 0
                    ? 'bg-neutral-100 dark:bg-neutral-800'
                    : hovered === d.date
                      ? 'bg-accent'
                      : 'bg-accent/70')
                }
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d) => (
          <div key={d.date} className="flex-1 text-center text-[10px] text-neutral-400 dark:text-neutral-600">
            {formatDayLabel(d.date)}
          </div>
        ))}
      </div>
    </Card>
  );
}
