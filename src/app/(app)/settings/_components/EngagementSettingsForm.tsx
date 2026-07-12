'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  REMINDER_TYPES,
  REMINDER_TYPE_LABELS,
  WEEKDAYS,
  WEEKDAY_LABELS,
  type EngagementSettingsData,
  type ReminderType,
  type Weekday,
} from '@/modules/engagement/domain/entities';
import { updateEngagementSettingsAction } from '../actions';

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-current"
      />
    </label>
  );
}

export function EngagementSettingsForm({ settings }: { settings: EngagementSettingsData }) {
  const router = useRouter();
  const [gamificationEnabled, setGamificationEnabled] = useState(settings.gamificationEnabled);
  const [showBadges, setShowBadges] = useState(settings.showBadges);
  const [remindersEnabled, setRemindersEnabled] = useState(settings.remindersEnabled);
  const [enabledReminderTypes, setEnabledReminderTypes] = useState<Set<ReminderType>>(
    new Set(settings.enabledReminderTypes)
  );
  const [reminderDays, setReminderDays] = useState<Set<Weekday>>(new Set(settings.reminderDays));
  const [reminderTime, setReminderTime] = useState(settings.reminderTime ?? '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes?.toString() ?? '');
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(settings.weeklyGoalMinutes?.toString() ?? '');
  const [monthlyGoalMinutes, setMonthlyGoalMinutes] = useState(settings.monthlyGoalMinutes?.toString() ?? '');
  const [pausedUntil, setPausedUntil] = useState(settings.pausedUntil?.slice(0, 10) ?? '');
  const [saving, setSaving] = useState(false);

  function toggleSet<T>(set: Set<T>, setSet: (next: Set<T>) => void, value: T) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateEngagementSettingsAction({
        gamificationEnabled,
        showBadges,
        remindersEnabled,
        enabledReminderTypes: Array.from(enabledReminderTypes),
        reminderDays: Array.from(reminderDays),
        reminderTime: reminderTime || null,
        dailyGoalMinutes: dailyGoalMinutes ? Number(dailyGoalMinutes) : null,
        weeklyGoalMinutes: weeklyGoalMinutes ? Number(weeklyGoalMinutes) : null,
        monthlyGoalMinutes: monthlyGoalMinutes ? Number(monthlyGoalMinutes) : null,
        pausedUntil: pausedUntil || null,
      });
      toast.success('Configurações salvas');
      router.refresh();
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold">Gamificação</h2>
        <Toggle checked={gamificationEnabled} onChange={setGamificationEnabled} label="Participar da gamificação (Jornada e Conquistas)" />
        <Toggle checked={showBadges} onChange={setShowBadges} label="Mostrar conquistas/badges" />
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold">Lembretes</h2>
        <Toggle checked={remindersEnabled} onChange={setRemindersEnabled} label="Receber lembretes" />

        <div className="mt-2 space-y-1">
          {REMINDER_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={enabledReminderTypes.has(type)}
                onChange={() => toggleSet(enabledReminderTypes, setEnabledReminderTypes, type)}
                className="h-3.5 w-3.5"
              />
              {REMINDER_TYPE_LABELS[type]}
            </label>
          ))}
        </div>

        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">Dias da semana</p>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleSet(reminderDays, setReminderDays, day)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium',
                  reminderDays.has(day)
                    ? 'border-transparent bg-accent text-white'
                    : 'border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
                )}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">Nenhum dia selecionado = todos os dias.</p>
        </div>

        <div className="mt-3 space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">A partir do horário</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold">Metas padrão</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Diária (min)</label>
            <input
              type="number"
              min={0}
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Semanal (min)</label>
            <input
              type="number"
              min={0}
              value={weeklyGoalMinutes}
              onChange={(e) => setWeeklyGoalMinutes(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Mensal (min)</label>
            <input
              type="number"
              min={0}
              value={monthlyGoalMinutes}
              onChange={(e) => setMonthlyGoalMinutes(e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold">Pausar durante férias ou licença</h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Pausar até</label>
          <input
            type="date"
            value={pausedUntil}
            onChange={(e) => setPausedUntil(e.target.value)}
            className="h-9 rounded-lg border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <p className="text-[11px] text-neutral-400">Enquanto pausado, os lembretes não aparecem.</p>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  );
}
