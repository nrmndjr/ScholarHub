import { Card } from '@/components/ui/Card';

function FrequencyList({ title, entries }: { title: string; entries: { label: string; count: number }[] }) {
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-xs text-neutral-400">Sem dados ainda.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.label} className="flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-300">
                {entry.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-accent" style={{ width: `${(entry.count / max) * 100}%` }} />
              </div>
              <span className="w-4 shrink-0 text-right text-xs text-neutral-400">{entry.count}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function ProjectMiniDashboard({
  topAuthors,
  topJournals,
  yearDistribution,
}: {
  topAuthors: { label: string; count: number }[];
  topJournals: { label: string; count: number }[];
  yearDistribution: { year: number; count: number }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <FrequencyList title="Autores mais frequentes" entries={topAuthors} />
      <FrequencyList title="Periódicos mais frequentes" entries={topJournals} />
      <FrequencyList
        title="Distribuição por ano"
        entries={yearDistribution.map((y) => ({ label: String(y.year), count: y.count }))}
      />
    </div>
  );
}
