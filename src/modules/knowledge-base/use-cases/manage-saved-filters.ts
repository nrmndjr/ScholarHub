import type { PrismaClient } from '@/generated/prisma/client';
import type { HighlightSearchFilters } from '../domain/entities';

export interface SavedFilterData {
  id: string;
  name: string;
  filters: HighlightSearchFilters;
}

export async function listSavedFilters(userId: string, deps: { prisma: PrismaClient }): Promise<SavedFilterData[]> {
  const rows = await deps.prisma.savedFilter.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => ({ id: r.id, name: r.name, filters: r.filters as HighlightSearchFilters }));
}

export async function createSavedFilter(
  userId: string,
  name: string,
  filters: HighlightSearchFilters,
  deps: { prisma: PrismaClient }
): Promise<SavedFilterData> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('O filtro precisa de um nome.');

  const row = await deps.prisma.savedFilter.create({
    data: { userId, name: trimmed, filters: filters as object },
  });
  return { id: row.id, name: row.name, filters: row.filters as HighlightSearchFilters };
}

export async function deleteSavedFilter(id: string, userId: string, deps: { prisma: PrismaClient }): Promise<void> {
  await deps.prisma.savedFilter.deleteMany({ where: { id, userId } });
}
