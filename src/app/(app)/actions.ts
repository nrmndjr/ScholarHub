'use server';

import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { globalSearch } from '@/modules/search/use-cases/global-search';

export async function globalSearchAction(query: string) {
  const user = await getCurrentUserOrThrow();
  return globalSearch(user.id, query, { prisma });
}
