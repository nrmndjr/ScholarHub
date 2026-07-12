import type { PrismaClient } from '@/generated/prisma/client';
import { getReadingStreak, type StreakData } from './get-reading-streak';
import { getWindowStart, computeGoalProgress } from './compute-goal-progress';
import { listGoalsWithProgress } from './manage-goals';
import { getAchievements } from './get-achievements';
import { GOAL_FREQUENCY_LABELS, GOAL_TYPE_METRICS, type GoalWithProgress } from '../domain/entities';

export interface EngagementOverview {
  currentStreak: number;
  longestStreak: number;
  minutesToday: number;
  pagesToday: number;
  articlesCompletedThisWeek: number;
  nearestGoal: { id: string; label: string; percent: number } | null;
  nextBadge: { emoji: string; label: string; percent: number } | null;
  motivation: string;
}

function goalLabel(goal: GoalWithProgress): string {
  const metricLabel = GOAL_TYPE_METRICS[goal.type].find((m) => m.metric === goal.metric)?.label ?? goal.type;
  return `${metricLabel} (meta ${GOAL_FREQUENCY_LABELS[goal.frequency]})`;
}

function pickMotivationMessage(input: {
  streak: StreakData;
  nearestGoal: GoalWithProgress | undefined;
  weekCompleted: number;
}): string {
  const { streak, nearestGoal } = input;

  if (nearestGoal && nearestGoal.percent >= 80) {
    const remaining = Math.max(1, nearestGoal.target - nearestGoal.progress);
    return `Faltam apenas ${remaining} para concluir sua meta de ${GOAL_TYPE_METRICS[nearestGoal.type]
      .find((m) => m.metric === nearestGoal.metric)
      ?.label.toLowerCase()}.`;
  }
  if (streak.currentStreak >= 14) {
    return `Parabéns — você manteve sua rotina de leitura por ${streak.currentStreak} dias seguidos.`;
  }
  if (streak.currentStreak >= 7) {
    return 'Sete dias consecutivos de leitura: a consistência é o que sustenta uma boa pesquisa.';
  }
  return 'As pesquisas mais consistentes costumam ser construídas um artigo por vez.';
}

export async function getEngagementOverview(
  userId: string,
  deps: { prisma: PrismaClient }
): Promise<EngagementOverview> {
  const [streak, goals, achievements, minutesToday, pagesToday, articlesCompletedThisWeek] = await Promise.all([
    getReadingStreak(userId, deps),
    listGoalsWithProgress(userId, deps),
    getAchievements(userId, deps),
    computeGoalProgress('TIME_MINUTES', userId, getWindowStart('DAILY'), deps),
    computeGoalProgress('PAGES_READ', userId, getWindowStart('DAILY'), deps),
    computeGoalProgress('ARTICLES_COMPLETED', userId, getWindowStart('WEEKLY'), deps),
  ]);

  const nearestGoal = goals
    .filter((g) => g.active && g.percent < 100)
    .sort((a, b) => b.percent - a.percent)[0];

  const nextBadge = achievements.filter((b) => !b.unlocked).sort((a, b) => b.percent - a.percent)[0];

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    minutesToday,
    pagesToday,
    articlesCompletedThisWeek,
    nearestGoal: nearestGoal ? { id: nearestGoal.id, label: goalLabel(nearestGoal), percent: nearestGoal.percent } : null,
    nextBadge: nextBadge ? { emoji: nextBadge.emoji, label: nextBadge.label, percent: nextBadge.percent } : null,
    motivation: pickMotivationMessage({ streak, nearestGoal, weekCompleted: articlesCompletedThisWeek }),
  };
}
