'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { changeArticleStatus, toggleArticleFavorite } from '@/modules/articles/use-cases/organize-article';
import { deleteArticle } from '@/modules/articles/use-cases/delete-article';
import {
  bulkSetFolder,
  bulkAddTag,
  bulkAddToProject,
  bulkChangeStatus,
} from '@/modules/articles/use-cases/bulk-organize-articles';

export async function changeStatusAction(articleId: string, status: string) {
  const user = await getCurrentUserOrThrow();
  await changeArticleStatus(articleId, user.id, status, { prisma });
  revalidatePath('/library');
}

export async function bulkSetFolderAction(articleIds: string[], folderId: string | null) {
  const user = await getCurrentUserOrThrow();
  await bulkSetFolder(articleIds, user.id, folderId, { prisma });
  revalidatePath('/library');
}

export async function bulkAddTagAction(articleIds: string[], tagId: string) {
  const user = await getCurrentUserOrThrow();
  await bulkAddTag(articleIds, user.id, tagId, { prisma });
  revalidatePath('/library');
}

export async function bulkAddToProjectAction(articleIds: string[], projectId: string) {
  const user = await getCurrentUserOrThrow();
  await bulkAddToProject(articleIds, user.id, projectId, { prisma });
  revalidatePath('/library');
}

export async function bulkChangeStatusAction(articleIds: string[], status: string) {
  const user = await getCurrentUserOrThrow();
  await bulkChangeStatus(articleIds, user.id, status, { prisma });
  revalidatePath('/library');
}

export async function toggleFavoriteAction(articleId: string) {
  const user = await getCurrentUserOrThrow();
  await toggleArticleFavorite(articleId, user.id, { prisma });
  revalidatePath('/library');
}

export async function deleteArticleAction(articleId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteArticle(articleId, user.id, { prisma, storage: getStorage() });
  revalidatePath('/library');
}
