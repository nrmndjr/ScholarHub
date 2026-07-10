import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

async function assertOwnership(articleId: string, userId: string, prisma: PrismaClient) {
  const article = await prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');
}

export async function setArticleFolder(
  articleId: string,
  userId: string,
  folderId: string | null,
  deps: { prisma: PrismaClient }
) {
  await assertOwnership(articleId, userId, deps.prisma);
  await deps.prisma.article.update({ where: { id: articleId }, data: { folderId } });
}

export async function setArticleTags(
  articleId: string,
  userId: string,
  tagIds: string[],
  deps: { prisma: PrismaClient }
) {
  await assertOwnership(articleId, userId, deps.prisma);
  await deps.prisma.articleTag.deleteMany({ where: { articleId } });
  if (tagIds.length > 0) {
    await deps.prisma.articleTag.createMany({ data: tagIds.map((tagId) => ({ articleId, tagId })) });
  }
}

export async function setArticleProjects(
  articleId: string,
  userId: string,
  projectIds: string[],
  deps: { prisma: PrismaClient }
) {
  await assertOwnership(articleId, userId, deps.prisma);
  await deps.prisma.articleProject.deleteMany({ where: { articleId } });
  if (projectIds.length > 0) {
    await deps.prisma.articleProject.createMany({ data: projectIds.map((projectId) => ({ articleId, projectId })) });
  }
}

export async function toggleArticleFavorite(articleId: string, userId: string, deps: { prisma: PrismaClient }) {
  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');
  await deps.prisma.article.update({ where: { id: articleId }, data: { favorite: !article.favorite } });
}

export async function changeArticleStatus(
  articleId: string,
  userId: string,
  status: string,
  deps: { prisma: PrismaClient }
) {
  await assertOwnership(articleId, userId, deps.prisma);
  await deps.prisma.article.update({ where: { id: articleId }, data: { status } });
}
