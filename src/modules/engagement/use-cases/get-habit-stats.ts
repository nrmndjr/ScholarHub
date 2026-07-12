import type { PrismaClient } from '@/generated/prisma/client';
import type { HabitStats } from '../domain/entities';

const WEEKDAY_LABELS_ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const HOUR_BLOCK_LABELS = ['00h', '04h', '08h', '12h', '16h', '20h'];

export async function getHabitStats(userId: string, deps: { prisma: PrismaClient }): Promise<HabitStats> {
  const [sessions, completedArticles, tags, projects] = await Promise.all([
    deps.prisma.readingSession.findMany({
      where: { userId },
      select: { startedAt: true, durationSeconds: true, startPage: true, endPage: true },
    }),
    deps.prisma.article.findMany({
      where: { userId, status: 'CONCLUIDO' },
      select: { createdAt: true, updatedAt: true },
    }),
    deps.prisma.tag.findMany({ where: { userId }, include: { _count: { select: { highlights: true } } } }),
    deps.prisma.project.findMany({ where: { userId }, include: { _count: { select: { articles: true } } } }),
  ]);

  const minutesByWeekday = new Array(7).fill(0);
  const minutesByHourBlock = new Array(6).fill(0);
  let totalSessionSeconds = 0;
  let closedSessionCount = 0;
  let totalPages = 0;
  let pagedSessionCount = 0;

  for (const s of sessions) {
    const minutes = (s.durationSeconds ?? 0) / 60;
    const weekday = (s.startedAt.getUTCDay() + 6) % 7; // 0=Mon..6=Sun
    minutesByWeekday[weekday] += minutes;
    const hourBlock = Math.floor(s.startedAt.getUTCHours() / 4);
    minutesByHourBlock[hourBlock] += minutes;

    if (s.durationSeconds != null) {
      totalSessionSeconds += s.durationSeconds;
      closedSessionCount++;
    }
    if (s.startPage != null && s.endPage != null && s.endPage > s.startPage) {
      totalPages += s.endPage - s.startPage;
      pagedSessionCount++;
    }
  }

  const avgSessionMinutes = closedSessionCount > 0 ? Math.round(totalSessionSeconds / closedSessionCount / 60) : 0;
  const avgPagesPerSession = pagedSessionCount > 0 ? Math.round(totalPages / pagedSessionCount) : 0;

  const completionDays = completedArticles
    .map((a) => (a.updatedAt.getTime() - a.createdAt.getTime()) / 86_400_000)
    .filter((d) => d >= 0);
  const avgDaysToComplete =
    completionDays.length > 0 ? Math.round((completionDays.reduce((s, d) => s + d, 0) / completionDays.length) * 10) / 10 : null;

  const topThemes = tags
    .map((t) => ({ label: t.name, value: t._count.highlights }))
    .filter((t) => t.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const topProjects = projects
    .map((p) => ({ label: p.name, value: p._count.articles }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    minutesByWeekday: minutesByWeekday.map((value, i) => ({ label: WEEKDAY_LABELS_ORDER[i], value: Math.round(value) })),
    minutesByHour: minutesByHourBlock.map((value, i) => ({ label: HOUR_BLOCK_LABELS[i], value: Math.round(value) })),
    avgSessionMinutes,
    avgPagesPerSession,
    avgDaysToComplete,
    topThemes,
    topProjects,
  };
}
