import { Flame, Clock, BookOpen, CheckCircle2, Target, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { EngagementOverview } from '@/modules/engagement/use-cases/get-engagement-overview';

function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0min';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}min`;
  return `${hours}h ${rest}min`;
}

function Tile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold leading-tight">{value}</p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      </div>
    </Card>
  );
}

export function OverviewStats({ overview }: { overview: EngagementOverview }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Tile icon={Flame} value={`${overview.currentStreak} dia${overview.currentStreak === 1 ? '' : 's'}`} label="Sequência de leitura" />
      <Tile icon={Clock} value={formatMinutes(overview.minutesToday)} label="Tempo de leitura hoje" />
      <Tile icon={BookOpen} value={String(overview.pagesToday)} label="Páginas lidas hoje" />
      <Tile icon={CheckCircle2} value={String(overview.articlesCompletedThisWeek)} label="Concluídos na semana" />
      <Tile
        icon={Target}
        value={overview.nearestGoal ? `${overview.nearestGoal.percent}%` : '—'}
        label={overview.nearestGoal ? overview.nearestGoal.label : 'Nenhuma meta ativa'}
      />
      <Tile
        icon={Award}
        value={overview.nextBadge ? `${overview.nextBadge.emoji} ${overview.nextBadge.percent}%` : 'Tudo desbloqueado'}
        label={overview.nextBadge ? `Próxima conquista: ${overview.nextBadge.label}` : 'Conquistas'}
      />
    </div>
  );
}
