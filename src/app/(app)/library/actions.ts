'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { changeArticleStatus, toggleArticleFavorite } from '@/modules/articles/use-cases/organize-article';

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
