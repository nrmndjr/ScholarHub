import type { PrismaClient } from '@/generated/prisma/client';
import { JOURNEY_STAGES, type JourneyStatus } from '../domain/entities';
import { getReadingStreak } from './get-reading-streak';

export async function getJourneyStatus(userId: string, deps: { prisma: PrismaClient }): Promise<JourneyStatus> {
  const [articlesCompleted, highlightsCount, commentsCount, manualEdges, citationsCount, documentsCount, streak] =
    await Promise.all([
      deps.prisma.article.count({ where: { userId, status: 'CONCLUIDO' } }),
      deps.prisma.highlight.count({ where: { userId } }),
      deps.prisma.comment.count({ where: { userId } }),
      deps.prisma.knowledgeMapEdge.count({ where: { userId, origin: 'MANUAL' } }),
      deps.prisma.writingBlock.count({ where: { userId, blockType: 'CITATION_REF' } }),
      deps.prisma.writingDocument.count({ where: { userId } }),
      getReadingStreak(userId, deps),
    ]);

  const points =
    articlesCompleted * 3 +
    highlightsCount * 1 +
    commentsCount * 2 +
    manualEdges * 4 +
    citationsCount * 3 +
    documentsCount * 5 +
    Math.min(streak.longestStreak, 30) * 1;

  let stageIndex = 0;
  for (let i = 0; i < JOURNEY_STAGES.length; i++) {
    if (points >= JOURNEY_STAGES[i].minPoints) stageIndex = i;
  }
  const stage = JOURNEY_STAGES[stageIndex];
  const nextStage = JOURNEY_STAGES[stageIndex + 1] ?? null;

  return {
    points,
    stage,
    nextStage,
    pointsToNextStage: nextStage ? nextStage.minPoints - points : null,
  };
}
