'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { changeArticleStatus, toggleArticleFavorite } from '@/modules/articles/use-cases/organize-article';
import { deleteArticle } from '@/modules/articles/use-cases/delete-article';

export async function changeStatusAction(articleId: string, status: string) {
  const user = await getCurrentUserOrThrow();
  await changeArticleStatus(articleId, user.id, status, { prisma });
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
