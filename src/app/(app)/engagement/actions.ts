'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createGoal, pauseGoal, resumeGoal, deleteGoal } from '@/modules/engagement/use-cases/manage-goals';
import type { GoalFrequency, GoalMetric, GoalType } from '@/modules/engagement/domain/entities';

export async function createGoalAction(input: {
  type: GoalType;
  metric: GoalMetric;
  frequency: GoalFrequency;
  target: number;
}) {
  const user = await getCurrentUserOrThrow();
  await createGoal(user.id, input, { prisma });
  revalidatePath('/engagement');
}

export async function pauseGoalAction(id: string) {
  const user = await getCurrentUserOrThrow();
  await pauseGoal(id, user.id, { prisma });
  revalidatePath('/engagement');
}

export async function resumeGoalAction(id: string) {
  const user = await getCurrentUserOrThrow();
  await resumeGoal(id, user.id, { prisma });
  revalidatePath('/engagement');
}

export async function deleteGoalAction(id: string) {
  const user = await getCurrentUserOrThrow();
  await deleteGoal(id, user.id, { prisma });
  revalidatePath('/engagement');
}
