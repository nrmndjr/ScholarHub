'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createProject } from '@/modules/projects/use-cases/create-project';
import { updateProject, deleteProject } from '@/modules/projects/use-cases/update-project';
import type { ProjectInput } from '@/lib/validation/project.schema';

export async function createProjectAction(input: ProjectInput) {
  const user = await getCurrentUserOrThrow();
  const project = await createProject(user.id, input, { prisma });
  revalidatePath('/projects');
  return project;
}

export async function updateProjectAction(projectId: string, input: ProjectInput) {
  const user = await getCurrentUserOrThrow();
  await updateProject(projectId, user.id, input, { prisma });
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(projectId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteProject(projectId, user.id, { prisma });
  revalidatePath('/projects');
}
