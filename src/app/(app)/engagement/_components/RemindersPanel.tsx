'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import type { Reminder } from '@/modules/engagement/domain/entities';

export function RemindersPanel({ reminders }: { reminders: Reminder[] }) {
  const [dismissed, setDismissed] = useState<Set<Reminder['type']>>(new Set());
  const visible = reminders.filter((r) => !dismissed.has(r.type));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-1.5">
      {visible.map((reminder) => (
        <div
          key={reminder.type}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <Bell className="h-4 w-4 shrink-0 text-neutral-400" />
          <p className="flex-1">{reminder.message}</p>
          <button
            type="button"
            onClick={() => setDismissed((prev) => new Set(prev).add(reminder.type))}
            aria-label="Dispensar lembrete"
            className="rounded-md p-1 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
