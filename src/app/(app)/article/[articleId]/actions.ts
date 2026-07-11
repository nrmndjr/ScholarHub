'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createHighlight } from '@/modules/highlights/use-cases/create-highlight';
import { deleteHighlight } from '@/modules/highlights/use-cases/delete-highlight';
import { setHighlightTags } from '@/modules/highlights/use-cases/set-highlight-tags';
import { createComment } from '@/modules/comments/use-cases/create-comment';
import { deleteComment } from '@/modules/comments/use-cases/delete-comment';
import { updateReadingProgress, updateSummary } from '@/modules/articles/use-cases/update-reading-progress';
import { closeOpenReadingSession } from '@/modules/articles/use-cases/reading-session';
import { createTag } from '@/modules/tags/use-cases/create-tag';
import type { HighlightColor, HighlightPositionData } from '@/modules/highlights/domain/entities';

export async function createHighlightAction(input: {
  articleId: string;
  color: HighlightColor;
  page: number;
  excerptText: string;
  positionData: HighlightPositionData;
  tagIds?: string[];
}) {
  const user = await getCurrentUserOrThrow();
  const highlight = await createHighlight({ userId: user.id, ...input }, { prisma });
  revalidatePath(`/article/${input.articleId}`);
  return highlight;
}

export async function setHighlightTagsAction(articleId: string, highlightId: string, tagIds: string[]) {
  const user = await getCurrentUserOrThrow();
  await setHighlightTags(highlightId, user.id, tagIds, { prisma });
  revalidatePath(`/article/${articleId}`);
}

export async function createTagAction(name: string) {
  const user = await getCurrentUserOrThrow();
  return createTag({ userId: user.id, name }, { prisma });
}

export async function deleteHighlightAction(articleId: string, highlightId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteHighlight(highlightId, user.id, { prisma });
  revalidatePath(`/article/${articleId}`);
}

export async function createCommentAction(input: {
  articleId: string;
  highlightId?: string | null;
  body: object;
}) {
  const user = await getCurrentUserOrThrow();
  const comment = await createComment({ userId: user.id, ...input }, { prisma });
  revalidatePath(`/article/${input.articleId}`);
  return comment;
}

export async function deleteCommentAction(articleId: string, commentId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteComment(commentId, user.id, { prisma });
  revalidatePath(`/article/${articleId}`);
}

export async function updateProgressAction(articleId: string, currentPage: number, totalPages?: number) {
  const user = await getCurrentUserOrThrow();
  await updateReadingProgress(articleId, user.id, { currentPage, totalPages }, { prisma });
}

export async function updateSummaryAction(articleId: string, summaryContent: object) {
  const user = await getCurrentUserOrThrow();
  await updateSummary(articleId, user.id, summaryContent, { prisma });
}

export async function closeSessionAction(articleId: string, endPage: number) {
  const user = await getCurrentUserOrThrow();
  await closeOpenReadingSession(articleId, user.id, endPage, { prisma });
}
