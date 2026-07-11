'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { renameWritingDocument } from '@/modules/writing/use-cases/manage-documents';
import {
  addTextBlock,
  addReferenceBlock,
  updateBlockText,
  deleteBlock,
  reorderBlocks,
} from '@/modules/writing/use-cases/manage-blocks';
import { listInsertableContent } from '@/modules/writing/use-cases/list-insertable-content';

export async function renameDocumentAction(documentId: string, title: string) {
  const user = await getCurrentUserOrThrow();
  await renameWritingDocument(documentId, user.id, title, { prisma });
  revalidatePath(`/writing/${documentId}`);
  revalidatePath('/writing');
}

export async function addTextBlockAction(documentId: string, textContent: string) {
  const user = await getCurrentUserOrThrow();
  const block = await addTextBlock(documentId, user.id, textContent, { prisma });
  revalidatePath(`/writing/${documentId}`);
  return block.id;
}

export async function addReferenceBlockAction(
  documentId: string,
  input:
    | { blockType: 'HIGHLIGHT_REF'; highlightId: string }
    | { blockType: 'COMMENT_REF'; commentId: string }
    | { blockType: 'SUMMARY_REF'; articleId: string }
    | { blockType: 'CITATION_REF'; articleId: string }
) {
  const user = await getCurrentUserOrThrow();
  const block = await addReferenceBlock(documentId, user.id, input, { prisma });
  revalidatePath(`/writing/${documentId}`);
  return block.id;
}

export async function updateBlockTextAction(blockId: string, textContent: string) {
  const user = await getCurrentUserOrThrow();
  await updateBlockText(blockId, user.id, textContent, { prisma });
}

export async function deleteBlockAction(documentId: string, blockId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteBlock(blockId, user.id, { prisma });
  revalidatePath(`/writing/${documentId}`);
}

export async function reorderBlocksAction(documentId: string, orderedBlockIds: string[]) {
  const user = await getCurrentUserOrThrow();
  await reorderBlocks(documentId, user.id, orderedBlockIds, { prisma });
}

export async function searchInsertableContentAction(search: string) {
  const user = await getCurrentUserOrThrow();
  return listInsertableContent(user.id, search || undefined, { prisma });
}
