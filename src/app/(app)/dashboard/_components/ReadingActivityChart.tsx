'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const RANGE_OPTIONS = [7, 14, 30] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number];

function formatDayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.getDate();
}

function formatFullDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function ReadingActivityChart({ data: fullData }: { data: Array<{ date: string; minutes: number }> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [range, setRange] = useState<RangeOption>(14);
  const data = fullData.slice(-range);
  const max = Math.max(1, ...data.map((d) => d.minutes));
  const hoveredEntry = data.find((d) => d.date === hovered);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Atividade de leitura</h2>
        <div className="flex items-center gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {hoveredEntry ? `${hoveredEntry.minutes} min · ${formatFullDate(hoveredEntry.date)}` : 'Minutos por dia'}
          </p>
          <div className="flex rounded-md border border-neutral-200 text-[11px] dark:border-neutral-800">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setRange(opt)}
                className={cn(
                  'px-1.5 py-0.5 font-medium first:rounded-l-md last:rounded-r-md',
                  range === opt
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                )}
              >
                {opt}d
              </button>
            ))}
          </div>
        </div>
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
