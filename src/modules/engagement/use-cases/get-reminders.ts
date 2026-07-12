import type { PrismaClient } from '@/generated/prisma/client';
import { getOrCreateSettings } from './manage-settings';
import { computeGoalProgress, getWindowStart } from './compute-goal-progress';
import { WEEKDAYS, type Reminder, type Weekday } from '../domain/entities';

const STALLED_AFTER_DAYS = 3;
const ALMOST_DONE_MAX_PAGES = 10;

function currentWeekday(): Weekday {
  const jsDay = new Date().getDay(); // 0=Sun..6=Sat
  return WEEKDAYS[(jsDay + 6) % 7];
}

export async function getReminders(userId: string, deps: { prisma: PrismaClient }): Promise<Reminder[]> {
  const settings = await getOrCreateSettings(userId, deps);

  if (!settings.remindersEnabled) return [];
  if (settings.pausedUntil && new Date(settings.pausedUntil) > new Date()) return [];
  if (settings.reminderDays.length > 0 && !settings.reminderDays.includes(currentWeekday())) return [];
  if (settings.reminderTime) {
    const [hour, minute] = settings.reminderTime.split(':').map(Number);
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < hour * 60 + minute) return [];
  }

  const reminders: Reminder[] = [];
  const enabled = new Set(settings.enabledReminderTypes);

  if (enabled.has('STALLED_ARTICLE')) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STALLED_AFTER_DAYS);
    const stalled = await deps.prisma.article.findFirst({
      where: { userId, status: 'LENDO', lastOpenedAt: { lte: cutoff } },
      orderBy: { lastOpenedAt: 'asc' },
      select: { title: true, lastOpenedAt: true },
    });
    if (stalled?.lastOpenedAt) {
      const days = Math.floor((Date.now() - stalled.lastOpenedAt.getTime()) / 86_400_000);
      reminders.push({
        type: 'STALLED_ARTICLE',
        message: `Você interrompeu a leitura de "${stalled.title}" há ${days} dias.`,
      });
    }
  }

  if (enabled.has('ALMOST_DONE')) {
    const inProgress = await deps.prisma.article.findMany({
      where: { userId, status: 'LENDO', totalPages: { not: null } },
      select: { title: true, currentPage: true, totalPages: true },
    });
    const almostDone = inProgress.find((a) => {
      const remaining = (a.totalPages ?? 0) - a.currentPage;
      return remaining > 0 && remaining <= ALMOST_DONE_MAX_PAGES;
    });
    if (almostDone) {
      const remaining = (almostDone.totalPages ?? 0) - almostDone.currentPage;
      reminders.push({
        type: 'ALMOST_DONE',
        message: `Faltam apenas ${remaining} página${remaining === 1 ? '' : 's'} para concluir "${almostDone.title}".`,
      });
    }
  }

  if (enabled.has('DAILY_GOAL') && settings.dailyGoalMinutes) {
    const minutesToday = await computeGoalProgress('TIME_MINUTES', userId, getWindowStart('DAILY'), deps);
    if (minutesToday < settings.dailyGoalMinutes) {
      reminders.push({ type: 'DAILY_GOAL', message: 'Você ainda não atingiu sua meta diária de leitura.' });
    }
  }

  if (enabled.has('INBOX_PENDING')) {
    const inboxCount = await deps.prisma.article.count({ where: { userId, stage: 'INBOX' } });
    if (inboxCount > 0) {
      reminders.push({
        type: 'INBOX_PENDING',
        message: `Há ${inboxCount} artigo${inboxCount === 1 ? '' : 's'} aguardando organização na Inbox.`,
      });
    }
  }

  return reminders;
}
