import type { PrismaClient } from '@/generated/prisma/client';
import { BADGE_DEFINITIONS, type BadgeKey, type BadgeStatus } from '../domain/entities';
import { getReadingStreak } from './get-reading-streak';

async function getBadgeProgress(userId: string, deps: { prisma: PrismaClient }): Promise<Record<BadgeKey, number>> {
  const [articlesCompleted, highlightsCount, commentsCount, inboxCount, libraryCount, manualEdges, citationsCount, tagsCount, streak] =
    await Promise.all([
      deps.prisma.article.count({ where: { userId, status: 'CONCLUIDO' } }),
      deps.prisma.highlight.count({ where: { userId } }),
      deps.prisma.comment.count({ where: { userId } }),
      deps.prisma.article.count({ where: { userId, stage: 'INBOX' } }),
      deps.prisma.article.count({ where: { userId, stage: 'LIBRARY' } }),
      deps.prisma.knowledgeMapEdge.count({ where: { userId, origin: 'MANUAL' } }),
      deps.prisma.writingBlock.count({ where: { userId, blockType: 'CITATION_REF' } }),
      deps.prisma.tag.count({ where: { userId } }),
      getReadingStreak(userId, deps),
    ]);

  return {
    PRIMEIRA_LEITURA: articlesCompleted,
    LEITOR_ASSIDUO: articlesCompleted,
    CURIOSO: highlightsCount,
    PESQUISADOR: commentsCount,
    ORGANIZADO: inboxCount === 0 && libraryCount > 0 ? 1 : 0,
    CONSISTENCIA: streak.longestStreak,
    MARATONISTA: streak.longestStreak,
    MESTRE_LITERATURA: articlesCompleted,
    CONECTOR_IDEIAS: manualEdges,
    SINTESE: citationsCount,
    CURADOR: tagsCount,
  };
}

export async function getAchievements(userId: string, deps: { prisma: PrismaClient }): Promise<BadgeStatus[]> {
  const [progressByBadge, unlockedRows] = await Promise.all([
    getBadgeProgress(userId, deps),
    deps.prisma.userAchievement.findMany({ where: { userId } }),
  ]);

  const unlockedMap = new Map(unlockedRows.map((r) => [r.badgeKey as BadgeKey, r.unlockedAt]));
  const newlyUnlocked: BadgeKey[] = [];

  const statuses: BadgeStatus[] = BADGE_DEFINITIONS.map((def) => {
    const progress = progressByBadge[def.key];
    const meetsThreshold = progress >= def.threshold;
    const existingUnlock = unlockedMap.get(def.key);
    if (meetsThreshold && !existingUnlock) newlyUnlocked.push(def.key);

    return {
      ...def,
      unlocked: meetsThreshold,
      unlockedAt: existingUnlock ? existingUnlock.toISOString() : meetsThreshold ? new Date().toISOString() : null,
      progress: Math.min(progress, def.threshold),
      percent: Math.min(100, Math.round((progress / def.threshold) * 100)),
    };
  });

  // First time a threshold is crossed, persist it so unlockedAt stays stable on future loads.
  if (newlyUnlocked.length > 0) {
    await deps.prisma.userAchievement.createMany({
      data: newlyUnlocked.map((badgeKey) => ({ userId, badgeKey })),
      skipDuplicates: true,
    });
  }

  return statuses;
}
