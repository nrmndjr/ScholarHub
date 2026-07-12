import type { PrismaClient } from '@/generated/prisma/client';

async function ownedIds(articleIds: string[], userId: string, prisma: PrismaClient): Promise<string[]> {
  const rows = await prisma.article.findMany({ where: { id: { in: articleIds }, userId }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function bulkSetFolder(
  articleIds: string[],
  userId: string,
  folderId: string | null,
  deps: { prisma: PrismaClient }
) {
  const ids = await ownedIds(articleIds, userId, deps.prisma);
  if (ids.length === 0) return;
  await deps.prisma.article.updateMany({ where: { id: { in: ids } }, data: { folderId } });
}

export async function bulkAddTag(
  articleIds: string[],
  userId: string,
  tagId: string,
  deps: { prisma: PrismaClient }
) {
  const ids = await ownedIds(articleIds, userId, deps.prisma);
  if (ids.length === 0) return;
  await deps.prisma.articleTag.createMany({
    data: ids.map((articleId) => ({ articleId, tagId })),
    skipDuplicates: true,
  });
}

export async function bulkAddToProject(
  articleIds: string[],
  userId: string,
  projectId: string,
  deps: { prisma: PrismaClient }
) {
  const ids = await ownedIds(articleIds, userId, deps.prisma);
  if (ids.length === 0) return;
  await deps.prisma.articleProject.createMany({
    data: ids.map((articleId) => ({ articleId, projectId })),
    skipDuplicates: true,
  });
}

export async function bulkChangeStatus(
  articleIds: string[],
  userId: string,
  status: string,
  deps: { prisma: PrismaClient }
) {
  const ids = await ownedIds(articleIds, userId, deps.prisma);
  if (ids.length === 0) return;
  await deps.prisma.article.updateMany({ where: { id: { in: ids } }, data: { status } });
}
