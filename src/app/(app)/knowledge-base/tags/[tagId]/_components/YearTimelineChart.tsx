'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

export function YearTimelineChart({ data }: { data: Array<{ year: number; count: number }> }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const hoveredEntry = data.find((d) => d.year === hovered);

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Linha do tempo das publicações</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {hoveredEntry
            ? `${hoveredEntry.count} artigo${hoveredEntry.count === 1 ? '' : 's'} · ${hoveredEntry.year}`
            : 'Artigos por ano de publicação'}
        </p>
      </div>

      {data.length === 0 ? (
        <p className="py-8 text-center text-xs text-neutral-400">Sem dados de publicação suficientes ainda.</p>
      ) : (
        <>
          <div className="flex h-28 gap-1">
            {data.map((d) => {
              const heightPct = Math.max(4, (d.count / max) * 100);
              return (
                <div
                  key={d.year}
                  className="group relative flex flex-1 flex-col justify-end"
                  onMouseEnter={() => setHovered(d.year)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={
                      'mx-auto w-full max-w-6 rounded-t-sm transition-colors ' +
                      (hovered === d.year ? 'bg-accent' : 'bg-accent/70')
                    }
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-1">
            {data.map((d) => (
              <div key={d.year} className="flex-1 text-center text-[10px] text-neutral-400 dark:text-neutral-600">
                {d.year}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
