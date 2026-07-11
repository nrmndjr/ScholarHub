'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  createManualConnection,
  deleteManualConnection,
  listArticlesForPicker,
} from '@/modules/knowledge-map/use-cases/manage-connections';
import type { ManualConnectionType } from '@/modules/knowledge-map/domain/entities';

export async function createManualConnectionAction(input: {
  sourceArticleId: string;
  targetArticleId: string;
  connectionType: ManualConnectionType;
  note?: string;
}) {
  const user = await getCurrentUserOrThrow();
  await createManualConnection({ userId: user.id, ...input }, { prisma });
  revalidatePath('/knowledge-map');
}

export async function deleteManualConnectionAction(edgeId: string) {
  const user = await getCurrentUserOrThrow();
  await deleteManualConnection(edgeId, user.id, { prisma });
  revalidatePath('/knowledge-map');
}

export async function listArticlesForPickerAction() {
  const user = await getCurrentUserOrThrow();
  return listArticlesForPicker(user.id, { prisma });
}
