import { Card } from '@/components/ui/Card';
import type { HabitBarDatum, HabitStats } from '@/modules/engagement/domain/entities';

function BarChart({ title, data, unit }: { title: string; data: HabitBarDatum[]; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex h-24 items-end gap-1.5">
        {data.map((d) => {
          const heightPct = d.value === 0 ? 0 : Math.max(4, (d.value / max) * 100);
          return (
            <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                title={`${d.label}: ${d.value} ${unit}`}
                style={{ height: `${heightPct}%` }}
                className={`w-full max-w-6 rounded-t-sm transition-colors ${
                  d.value === 0 ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-accent/70 group-hover:bg-accent'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[10px] text-neutral-400">
            {d.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

function RankBars({ title, data, emptyLabel }: { title: string; data: HabitBarDatum[]; emptyLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {data.length === 0 ? (
        <p className="text-xs text-neutral-400">{emptyLabel}</p>
      ) : (
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-neutral-500 dark:text-neutral-400">{d.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(d.value / max) * 100}%` }} />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-neutral-400">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <Card className="p-4">
      <p className="text-xl font-semibold leading-tight">{value}</p>
      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
    </Card>
  );
}

export function HabitStatsCharts({ stats }: { stats: HabitStats }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold">Estatísticas de Hábitos</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile value={`${stats.avgSessionMinutes}min`} label="Tempo médio por sessão" />
        <StatTile value={String(stats.avgPagesPerSession)} label="Média de páginas por sessão" />
        <StatTile
          value={stats.avgDaysToComplete != null ? `${stats.avgDaysToComplete}d` : '—'}
          label="Tempo médio para concluir um artigo"
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BarChart title="Dias da semana em que mais lê" data={stats.minutesByWeekday} unit="min" />
        <BarChart title="Horário em que costuma estudar" data={stats.minutesByHour} unit="min" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RankBars title="Temas mais estudados" data={stats.topThemes} emptyLabel="Sem destaques com tags ainda." />
        <RankBars title="Projetos mais ativos" data={stats.topProjects} emptyLabel="Sem artigos vinculados a projetos ainda." />
      </div>
    </div>
  );
}
