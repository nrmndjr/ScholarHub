'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { updateSettings } from '@/modules/engagement/use-cases/manage-settings';
import type { ReminderType, Weekday } from '@/modules/engagement/domain/entities';

export async function updateEngagementSettingsAction(
  patch: Partial<{
    gamificationEnabled: boolean;
    showBadges: boolean;
    remindersEnabled: boolean;
    enabledReminderTypes: ReminderType[];
    reminderDays: Weekday[];
    reminderTime: string | null;
    dailyGoalMinutes: number | null;
    weeklyGoalMinutes: number | null;
    monthlyGoalMinutes: number | null;
    pausedUntil: string | null;
  }>
) {
  const user = await getCurrentUserOrThrow();
  await updateSettings(user.id, patch, { prisma });
  revalidatePath('/settings');
  revalidatePath('/engagement');
}
