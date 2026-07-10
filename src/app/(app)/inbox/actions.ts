'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { updateArticleMetadata } from '@/modules/articles/use-cases/update-article-metadata';
import { archiveArticleToLibrary } from '@/modules/articles/use-cases/archive-article';
import { setArticleFolder, setArticleTags, setArticleProjects } from '@/modules/articles/use-cases/organize-article';
import { createFolder } from '@/modules/folders/use-cases/create-folder';
import { createTag } from '@/modules/tags/use-cases/create-tag';
import type { UpdateArticleMetadataInput } from '@/lib/validation/article.schema';

export async function updateMetadataAction(articleId: string, input: UpdateArticleMetadataInput) {
  const user = await getCurrentUserOrThrow();
  await updateArticleMetadata(articleId, user.id, input, { prisma });
  revalidatePath('/inbox');
}

export async function setFolderAction(articleId: string, folderId: string | null) {
  const user = await getCurrentUserOrThrow();
  await setArticleFolder(articleId, user.id, folderId, { prisma });
  revalidatePath('/inbox');
}

export async function setTagsAction(articleId: string, tagIds: string[]) {
  const user = await getCurrentUserOrThrow();
  await setArticleTags(articleId, user.id, tagIds, { prisma });
  revalidatePath('/inbox');
}

export async function setProjectsAction(articleId: string, projectIds: string[]) {
  const user = await getCurrentUserOrThrow();
  await setArticleProjects(articleId, user.id, projectIds, { prisma });
  revalidatePath('/inbox');
}

export async function archiveAction(articleId: string) {
  const user = await getCurrentUserOrThrow();
  await archiveArticleToLibrary(articleId, user.id, { prisma });
  revalidatePath('/inbox');
  revalidatePath('/library');
}

export async function createFolderAction(name: string) {
  const user = await getCurrentUserOrThrow();
  const folder = await createFolder({ userId: user.id, name }, { prisma });
  revalidatePath('/inbox');
  return folder;
}

export async function createTagAction(name: string) {
  const user = await getCurrentUserOrThrow();
  const tag = await createTag({ userId: user.id, name }, { prisma });
  revalidatePath('/inbox');
  return tag;
}
