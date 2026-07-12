import type { PrismaClient } from '@/generated/prisma/client';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  /** date (YYYY-MM-DD) -> minutes read, covers the last HEATMAP_DAYS days */
  activityByDate: Record<string, number>;
}

const HEATMAP_DAYS = 371;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function computeCurrentStreak(days: Set<string>): number {
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!days.has(dateKey(cursor))) {
    // Today has no activity yet — don't zero the streak just because the day isn't over.
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let streak = 0;
  while (days.has(dateKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function computeLongestStreak(days: Set<string>): number {
  const sorted = Array.from(days).sort();
  let longest = 0;
  let run = 0;
  let prevTime: number | null = null;
  for (const key of sorted) {
    const time = new Date(`${key}T00:00:00Z`).getTime();
    run = prevTime !== null && time - prevTime === 86_400_000 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prevTime = time;
  }
  return longest;
}

export async function getReadingStreak(userId: string, deps: { prisma: PrismaClient }): Promise<StreakData> {
  const sessions = await deps.prisma.readingSession.findMany({
    where: { userId },
    select: { startedAt: true, durationSeconds: true, endedAt: true },
  });

  const now = Date.now();
  const minutesByDate: Record<string, number> = {};
  const allDays = new Set<string>();

  for (const s of sessions) {
    const key = dateKey(s.startedAt);
    allDays.add(key);
    const seconds = s.durationSeconds ?? (s.endedAt ? 0 : Math.max(0, (now - s.startedAt.getTime()) / 1000));
    minutesByDate[key] = (minutesByDate[key] ?? 0) + Math.round(seconds / 60);
  }

  const heatmapStart = new Date();
  heatmapStart.setUTCDate(heatmapStart.getUTCDate() - (HEATMAP_DAYS - 1));
  const heatmapStartKey = dateKey(heatmapStart);
  const activityByDate = Object.fromEntries(
    Object.entries(minutesByDate).filter(([key]) => key >= heatmapStartKey)
  );

  return {
    currentStreak: computeCurrentStreak(allDays),
    longestStreak: computeLongestStreak(allDays),
    activityByDate,
  };
}
