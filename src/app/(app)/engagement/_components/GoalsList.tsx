'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, Pause, Play, Trash2, Target } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GOAL_TYPE_METRICS, GOAL_FREQUENCY_LABELS, type GoalWithProgress } from '@/modules/engagement/domain/entities';
import { pauseGoalAction, resumeGoalAction, deleteGoalAction } from '../actions';
import { GoalFormDialog } from './GoalFormDialog';

function goalTitle(goal: GoalWithProgress): string {
  const metricLabel = GOAL_TYPE_METRICS[goal.type].find((m) => m.metric === goal.metric)?.label ?? goal.type;
  return `${metricLabel} · meta ${GOAL_FREQUENCY_LABELS[goal.frequency]}`;
}

function GoalRow({ goal }: { goal: GoalWithProgress }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleTogglePause() {
    startTransition(async () => {
      await (goal.active ? pauseGoalAction(goal.id) : resumeGoalAction(goal.id));
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm('Excluir esta meta?')) return;
    startTransition(async () => {
      await deleteGoalAction(goal.id);
      toast.success('Meta excluída');
      router.refresh();
    });
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{goalTitle(goal)}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {goal.active ? `${goal.progress} de ${goal.target}` : 'Pausada'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={handleTogglePause}
            title={goal.active ? 'Pausar meta' : 'Retomar meta'}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            {goal.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            title="Excluir meta"
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${goal.active ? goal.percent : 0}%` }}
        />
      </div>
    </Card>
  );
}

export function GoalsList({ goals }: { goals: GoalWithProgress[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Metas Pessoais</h2>
        <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-8 text-center">
          <Target className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm text-neutral-400">
            Nenhuma meta ainda. Defina um objetivo simples para começar — ex: 2 artigos por semana.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <GoalFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
