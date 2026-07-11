import type { PrismaClient } from '@/generated/prisma/client';
import type { HighlightColor } from '@/modules/highlights/domain/entities';

const ACTIVITY_DAYS = 14;

export interface DashboardData {
  counts: {
    inbox: number;
    library: number;
    reading: number;
    completed: number;
  };
  totalReadingSeconds: number;
  highlightsByColor: Array<{ color: HighlightColor; count: number }>;
  dailyReadingMinutes: Array<{ date: string; minutes: number }>;
  continueReading: Array<{
    id: string;
    title: string;
    authors: string[];
    progress: number | null;
    lastOpenedAt: string;
  }>;
  activeProjects: Array<{
    id: string;
    name: string;
    color: string | null;
    articleCount: number;
  }>;
}

export async function getDashboardData(userId: string, deps: { prisma: PrismaClient }): Promise<DashboardData> {
  const since = new Date();
  since.setDate(since.getDate() - (ACTIVITY_DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [
    inboxCount,
    libraryCount,
    readingCount,
    completedCount,
    highlightGroups,
    readingSessions,
    recentArticles,
    projects,
  ] = await Promise.all([
    deps.prisma.article.count({ where: { userId, stage: 'INBOX' } }),
    deps.prisma.article.count({ where: { userId, stage: 'LIBRARY' } }),
    deps.prisma.article.count({ where: { userId, status: 'LENDO' } }),
    deps.prisma.article.count({ where: { userId, status: 'CONCLUIDO' } }),
    deps.prisma.highlight.groupBy({ by: ['color'], where: { userId }, _count: { _all: true } }),
    deps.prisma.readingSession.findMany({
      where: { userId, startedAt: { gte: since } },
      select: { startedAt: true, durationSeconds: true },
    }),
    deps.prisma.article.findMany({
      where: { userId, lastOpenedAt: { not: null } },
      orderBy: { lastOpenedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        currentPage: true,
        totalPages: true,
        lastOpenedAt: true,
        authors: { orderBy: { position: 'asc' }, select: { author: { select: { name: true } } } },
      },
    }),
    deps.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { _count: { select: { articles: true } } },
    }),
  ]);

  const totalReadingSeconds = readingSessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);

  const minutesByDate = new Map<string, number>();
  for (const session of readingSessions) {
    const key = session.startedAt.toISOString().slice(0, 10);
    const minutes = (session.durationSeconds ?? 0) / 60;
    minutesByDate.set(key, (minutesByDate.get(key) ?? 0) + minutes);
  }

  const dailyReadingMinutes: Array<{ date: string; minutes: number }> = [];
  for (let i = 0; i < ACTIVITY_DAYS; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyReadingMinutes.push({ date: key, minutes: Math.round(minutesByDate.get(key) ?? 0) });
  }

  return {
    counts: { inbox: inboxCount, library: libraryCount, reading: readingCount, completed: completedCount },
    totalReadingSeconds,
    highlightsByColor: highlightGroups
      .map((g) => ({ color: g.color as HighlightColor, count: g._count._all }))
      .sort((a, b) => b.count - a.count),
    dailyReadingMinutes,
    continueReading: recentArticles.map((a) => ({
      id: a.id,
      title: a.title,
      authors: a.authors.map((x) => x.author.name),
      progress: a.totalPages ? Math.min(1, a.currentPage / a.totalPages) : null,
      lastOpenedAt: a.lastOpenedAt!.toISOString(),
    })),
    activeProjects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      articleCount: p._count.articles,
    })),
  };
}
