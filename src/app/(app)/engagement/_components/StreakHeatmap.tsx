import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const HEATMAP_DAYS = 371;
const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface DayCell {
  date: string | null;
  minutes: number;
}

function buildWeeks(activityByDate: Record<string, number>): DayCell[][] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const days: DayCell[] = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, minutes: activityByDate[key] ?? 0 });
  }

  // Pad the front so the first column starts on a Sunday, GitHub-style.
  const firstDow = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const padded: DayCell[] = [...Array(firstDow).fill({ date: null, minutes: 0 }), ...days];

  const weeks: DayCell[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }
  return weeks;
}

function levelClass(minutes: number, max: number): string {
  if (minutes <= 0) return 'bg-neutral-100 dark:bg-neutral-800';
  if (max <= 0) return 'bg-neutral-100 dark:bg-neutral-800';
  const ratio = minutes / max;
  if (ratio <= 0.25) return 'bg-accent/25';
  if (ratio <= 0.5) return 'bg-accent/50';
  if (ratio <= 0.75) return 'bg-accent/75';
  return 'bg-accent';
}

function formatFullDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function StreakHeatmap({
  currentStreak,
  longestStreak,
  activityByDate,
}: {
  currentStreak: number;
  longestStreak: number;
  activityByDate: Record<string, number>;
}) {
  const weeks = buildWeeks(activityByDate);
  const max = Math.max(1, ...Object.values(activityByDate));

  // One label per month, placed at the week column where that month first appears.
  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstRealDay = week.find((d) => d.date);
    if (!firstRealDay?.date) return;
    const month = new Date(`${firstRealDay.date}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex, label: MONTH_LABELS[month] });
      lastMonth = month;
    }
  });

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Reading Streak</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          🔥 {currentStreak} dia{currentStreak === 1 ? '' : 's'} consecutivo{currentStreak === 1 ? '' : 's'} · recorde de{' '}
          {longestStreak} dia{longestStreak === 1 ? '' : 's'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="mb-1 flex gap-[3px] pl-6 text-[10px] text-neutral-400">
            {weeks.map((_, weekIndex) => {
              const label = monthLabels.find((m) => m.weekIndex === weekIndex);
              return (
                <div key={weekIndex} className="w-[11px] shrink-0">
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>
          <div className="flex gap-[3px]">
            <div className="flex shrink-0 flex-col gap-[3px] pr-1 text-[10px] text-neutral-400">
              <div className="h-[11px]" />
              <div className="h-[11px] leading-[11px]">seg</div>
              <div className="h-[11px]" />
              <div className="h-[11px] leading-[11px]">qua</div>
              <div className="h-[11px]" />
              <div className="h-[11px] leading-[11px]">sex</div>
              <div className="h-[11px]" />
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex shrink-0 flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    title={day.date ? `${formatFullDate(day.date)} · ${day.minutes} min` : undefined}
                    className={cn('h-[11px] w-[11px] rounded-[2px]', day.date && levelClass(day.minutes, max))}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-neutral-400">
        <span>Menos</span>
        <div className="h-[11px] w-[11px] rounded-[2px] bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-accent/25" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-accent/50" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-accent/75" />
        <div className="h-[11px] w-[11px] rounded-[2px] bg-accent" />
        <span>Mais</span>
      </div>
    </Card>
  );
}
