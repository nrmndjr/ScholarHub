'use server';

import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { searchHighlights } from '@/modules/knowledge-base/use-cases/search-highlights';
import type { HighlightSearchFilters } from '@/modules/knowledge-base/domain/entities';

export async function searchHighlightsAction(filters: HighlightSearchFilters) {
  const user = await getCurrentUserOrThrow();
  return searchHighlights(user.id, filters, { prisma });
}
