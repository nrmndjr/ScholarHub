import { Card } from '@/components/ui/Card';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';

export function HighlightsBreakdown({ data }: { data: Array<{ color: HighlightColor; count: number }> }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Destaques por tipo</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{total} no total</p>
      </div>

      {total === 0 ? (
        <p className="text-xs text-neutral-400">Nenhum destaque criado ainda.</p>
      ) : (
        <div className="space-y-2">
          {data.map(({ color, count }) => {
            const meta = HIGHLIGHT_COLOR_META[color];
            return (
              <div key={color} className="flex items-center gap-2 text-xs">
                <span className="w-32 shrink-0 truncate text-neutral-600 dark:text-neutral-300">
                  {meta.emoji} {meta.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(count / max) * 100}%`, backgroundColor: meta.cssVar }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-neutral-500 dark:text-neutral-400">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
