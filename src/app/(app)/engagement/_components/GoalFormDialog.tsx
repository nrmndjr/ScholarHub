'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import {
  GOAL_TYPES,
  GOAL_TYPE_LABELS,
  GOAL_TYPE_METRICS,
  GOAL_FREQUENCIES,
  GOAL_FREQUENCY_LABELS,
  type GoalType,
  type GoalMetric,
  type GoalFrequency,
} from '@/modules/engagement/domain/entities';
import { createGoalAction } from '../actions';

export function GoalFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [type, setType] = useState<GoalType>('ARTICLES');
  const [metric, setMetric] = useState<GoalMetric>(GOAL_TYPE_METRICS.ARTICLES[0].metric);
  const [frequency, setFrequency] = useState<GoalFrequency>('WEEKLY');
  const [target, setTarget] = useState('2');
  const [saving, setSaving] = useState(false);

  function handleTypeChange(next: GoalType) {
    setType(next);
    setMetric(GOAL_TYPE_METRICS[next][0].metric);
  }

  async function handleSubmit() {
    const targetNumber = Number(target);
    if (!targetNumber || targetNumber <= 0) {
      toast.error('Informe um alvo maior que zero.');
      return;
    }
    setSaving(true);
    try {
      await createGoalAction({ type, metric, frequency, target: targetNumber });
      toast.success('Meta criada');
      onOpenChange(false);
      setTarget('2');
      router.refresh();
    } catch {
      toast.error('Erro ao criar meta');
    } finally {
      setSaving(false);
    }
  }

  const metricOptions = GOAL_TYPE_METRICS[type];
  const unit = metricOptions.find((m) => m.metric === metric)?.unit ?? '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Nova meta" className="max-w-sm">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tipo</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as GoalType)}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {GOAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {GOAL_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {metricOptions.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Métrica</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as GoalMetric)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {metricOptions.map((m) => (
                <option key={m.metric} value={m.metric}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Frequência</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as GoalFrequency)}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            {GOAL_FREQUENCIES.map((f) => (
              <option key={f} value={f}>
                {GOAL_FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Alvo ({unit})</label>
          <input
            type="number"
            min={1}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Criar meta'}
        </Button>
      </div>
    </Dialog>
  );
}
