import type { PrismaClient } from '@/generated/prisma/client';
import type { GoalFrequency, GoalMetric } from '../domain/entities';

export function getWindowStart(frequency: GoalFrequency, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setUTCHours(0, 0, 0, 0);
  if (frequency === 'DAILY') return d;
  if (frequency === 'WEEKLY') {
    const daysSinceMonday = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - daysSinceMonday);
    return d;
  }
  d.setUTCDate(1);
  return d;
}

export async function computeGoalProgress(
  metric: GoalMetric,
  userId: string,
  windowStart: Date,
  deps: { prisma: PrismaClient }
): Promise<number> {
  switch (metric) {
    case 'ARTICLES_COMPLETED':
      return deps.prisma.article.count({ where: { userId, status: 'CONCLUIDO', updatedAt: { gte: windowStart } } });

    case 'HIGHLIGHTS_CREATED':
      return deps.prisma.highlight.count({ where: { userId, createdAt: { gte: windowStart } } });

    case 'WRITING_CITATIONS':
      return deps.prisma.writingBlock.count({
        where: { userId, blockType: 'CITATION_REF', createdAt: { gte: windowStart } },
      });

    case 'WRITING_DOCUMENTS':
      return deps.prisma.writingDocument.count({ where: { userId, createdAt: { gte: windowStart } } });

    case 'TIME_MINUTES': {
      const sessions = await deps.prisma.readingSession.findMany({
        where: { userId, startedAt: { gte: windowStart } },
        select: { durationSeconds: true, endedAt: true, startedAt: true },
      });
      const now = Date.now();
      const totalSeconds = sessions.reduce(
        (sum, s) => sum + (s.durationSeconds ?? (s.endedAt ? 0 : Math.max(0, (now - s.startedAt.getTime()) / 1000))),
        0
      );
      return Math.round(totalSeconds / 60);
    }

    case 'PAGES_READ': {
      const sessions = await deps.prisma.readingSession.findMany({
        where: { userId, startedAt: { gte: windowStart } },
        select: { startPage: true, endPage: true },
      });
      return sessions.reduce((sum, s) => sum + Math.max(0, (s.endPage ?? s.startPage ?? 0) - (s.startPage ?? 0)), 0);
    }
  }
}
