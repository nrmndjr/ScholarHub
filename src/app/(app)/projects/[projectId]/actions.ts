'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  addArticleToProject,
  removeArticleFromProject,
  listLibraryArticlesNotInProject,
} from '@/modules/projects/use-cases/manage-project-articles';

export async function addArticleToProjectAction(projectId: string, articleId: string) {
  const user = await getCurrentUserOrThrow();
  await addArticleToProject(projectId, articleId, user.id, { prisma });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeArticleFromProjectAction(projectId: string, articleId: string) {
  const user = await getCurrentUserOrThrow();
  await removeArticleFromProject(projectId, articleId, user.id, { prisma });
  revalidatePath(`/projects/${projectId}`);
}

export async function listAvailableArticlesAction(projectId: string) {
  const user = await getCurrentUserOrThrow();
  return listLibraryArticlesNotInProject(user.id, projectId, { prisma });
}
