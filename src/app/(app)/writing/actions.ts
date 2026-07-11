'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createWritingDocument, deleteWritingDocument } from '@/modules/writing/use-cases/manage-documents';

export async function createWritingDocumentAction(input: { title: string; projectId?: string | null }) {
  const user = await getCurrentUserOrThrow();
  const document = await createWritingDocument(user.id, input, { prisma });
  revalidatePath('/writing');
  return document;
}

export async function deleteWritingDocumentAction(documentId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteWritingDocument(documentId, user.id, { prisma });
  revalidatePath('/writing');
}
