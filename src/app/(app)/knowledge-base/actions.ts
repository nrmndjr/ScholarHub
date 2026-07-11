'use server';

import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { searchHighlights } from '@/modules/knowledge-base/use-cases/search-highlights';
import {
  listSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
} from '@/modules/knowledge-base/use-cases/manage-saved-filters';
import type { HighlightSearchFilters } from '@/modules/knowledge-base/domain/entities';

export async function searchHighlightsAction(filters: HighlightSearchFilters) {
  const user = await getCurrentUserOrThrow();
  return searchHighlights(user.id, filters, { prisma });
}

export async function listSavedFiltersAction() {
  const user = await getCurrentUserOrThrow();
  return listSavedFilters(user.id, { prisma });
}

export async function createSavedFilterAction(name: string, filters: HighlightSearchFilters) {
  const user = await getCurrentUserOrThrow();
  return createSavedFilter(user.id, name, filters, { prisma });
}

export async function deleteSavedFilterAction(id: string) {
  const user = await getCurrentUserOrThrow();
  await deleteSavedFilter(id, user.id, { prisma });
}
