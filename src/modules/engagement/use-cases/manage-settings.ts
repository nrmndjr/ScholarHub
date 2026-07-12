import type { PrismaClient } from '@/generated/prisma/client';
import type { EngagementSettingsData, ReminderType, Weekday } from '../domain/entities';

function toDomain(row: {
  gamificationEnabled: boolean;
  showBadges: boolean;
  remindersEnabled: boolean;
  enabledReminderTypes: unknown;
  reminderDays: unknown;
  reminderTime: string | null;
  dailyGoalMinutes: number | null;
  weeklyGoalMinutes: number | null;
  monthlyGoalMinutes: number | null;
  pausedUntil: Date | null;
}): EngagementSettingsData {
  return {
    gamificationEnabled: row.gamificationEnabled,
    showBadges: row.showBadges,
    remindersEnabled: row.remindersEnabled,
    enabledReminderTypes: row.enabledReminderTypes as ReminderType[],
    reminderDays: row.reminderDays as Weekday[],
    reminderTime: row.reminderTime,
    dailyGoalMinutes: row.dailyGoalMinutes,
    weeklyGoalMinutes: row.weeklyGoalMinutes,
    monthlyGoalMinutes: row.monthlyGoalMinutes,
    pausedUntil: row.pausedUntil ? row.pausedUntil.toISOString() : null,
  };
}

export async function getOrCreateSettings(
  userId: string,
  deps: { prisma: PrismaClient }
): Promise<EngagementSettingsData> {
  const existing = await deps.prisma.engagementSettings.findUnique({ where: { userId } });
  if (existing) return toDomain(existing);

  const created = await deps.prisma.engagementSettings.create({ data: { userId } });
  return toDomain(created);
}

export async function updateSettings(
  userId: string,
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
  }>,
  deps: { prisma: PrismaClient }
): Promise<void> {
  await deps.prisma.engagementSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...patch,
      pausedUntil: patch.pausedUntil ? new Date(patch.pausedUntil) : undefined,
    },
    update: {
      ...patch,
      pausedUntil: patch.pausedUntil === undefined ? undefined : patch.pausedUntil ? new Date(patch.pausedUntil) : null,
    },
  });
}
