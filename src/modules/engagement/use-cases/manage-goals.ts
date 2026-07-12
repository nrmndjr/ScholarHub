import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import { computeGoalProgress, getWindowStart } from './compute-goal-progress';
import type { GoalFrequency, GoalMetric, GoalType, GoalWithProgress } from '../domain/entities';

async function assertOwnership(id: string, userId: string, prisma: PrismaClient) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw new NotFoundError('Meta não encontrada');
}

export async function createGoal(
  userId: string,
  input: { type: GoalType; metric: GoalMetric; frequency: GoalFrequency; target: number },
  deps: { prisma: PrismaClient }
) {
  if (input.target <= 0) throw new Error('A meta precisa de um alvo maior que zero.');
  return deps.prisma.goal.create({ data: { userId, ...input } });
}

export async function pauseGoal(id: string, userId: string, deps: { prisma: PrismaClient }) {
  await assertOwnership(id, userId, deps.prisma);
  await deps.prisma.goal.update({ where: { id }, data: { active: false, pausedAt: new Date() } });
}

export async function resumeGoal(id: string, userId: string, deps: { prisma: PrismaClient }) {
  await assertOwnership(id, userId, deps.prisma);
  await deps.prisma.goal.update({ where: { id }, data: { active: true, pausedAt: null } });
}

export async function deleteGoal(id: string, userId: string, deps: { prisma: PrismaClient }) {
  await assertOwnership(id, userId, deps.prisma);
  await deps.prisma.goal.delete({ where: { id } });
}

export async function listGoalsWithProgress(
  userId: string,
  deps: { prisma: PrismaClient }
): Promise<GoalWithProgress[]> {
  const goals = await deps.prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

  return Promise.all(
    goals.map(async (g) => {
      const frequency = g.frequency as GoalFrequency;
      const progress = g.active
        ? await computeGoalProgress(g.metric as GoalMetric, userId, getWindowStart(frequency), deps)
        : 0;
      const percent = g.target > 0 ? Math.min(100, Math.round((progress / g.target) * 100)) : 0;

      return {
        id: g.id,
        type: g.type as GoalType,
        metric: g.metric as GoalMetric,
        frequency,
        target: g.target,
        active: g.active,
        pausedAt: g.pausedAt ? g.pausedAt.toISOString() : null,
        startDate: g.startDate.toISOString(),
        progress,
        percent,
      };
    })
  );
}
