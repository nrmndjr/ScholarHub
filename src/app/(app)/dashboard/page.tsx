import { Inbox, Library, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getDashboardData } from '@/modules/dashboard/use-cases/get-dashboard-data';
import { StatCard } from './_components/StatCard';
import { ReadingActivityChart } from './_components/ReadingActivityChart';
import { HighlightsBreakdown } from './_components/HighlightsBreakdown';
import { ContinueReading } from './_components/ContinueReading';
import { ActiveProjects } from './_components/ActiveProjects';

function formatReadingTime(totalSeconds: number) {
  if (totalSeconds <= 0) return '0min';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

export default async function DashboardPage() {
  const user = await getCurrentUserOrThrow();
  const data = await getDashboardData(user.id, { prisma });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Visão geral da sua pesquisa e progresso de leitura.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Na Inbox" value={String(data.counts.inbox)} icon={Inbox} href="/inbox" />
        <StatCard label="Na Biblioteca" value={String(data.counts.library)} icon={Library} href="/library" />
        <StatCard label="Lendo agora" value={String(data.counts.reading)} icon={BookOpen} href="/library?status=LENDO" />
        <StatCard
          label="Concluídos"
          value={String(data.counts.completed)}
          icon={CheckCircle2}
          href="/library?status=CONCLUIDO"
        />
        <StatCard label="Tempo de leitura" value={formatReadingTime(data.totalReadingSeconds)} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReadingActivityChart data={data.dailyReadingMinutes} />
        </div>
        <HighlightsBreakdown data={data.highlightsByColor} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContinueReading items={data.continueReading} />
        <ActiveProjects projects={data.activeProjects} />
      </div>
    </div>
  );
}
