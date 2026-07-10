import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

async function assertProjectOwnership(projectId: string, userId: string, prisma: PrismaClient) {
  const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Projeto não encontrado');
}

export async function addArticleToProject(
  projectId: string,
  articleId: string,
  userId: string,
  deps: { prisma: PrismaClient }
) {
  await assertProjectOwnership(projectId, userId, deps.prisma);
  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  await deps.prisma.articleProject.upsert({
    where: { articleId_projectId: { articleId, projectId } },
    update: {},
    create: { articleId, projectId },
  });
}

export async function removeArticleFromProject(
  projectId: string,
  articleId: string,
  userId: string,
  deps: { prisma: PrismaClient }
) {
  await assertProjectOwnership(projectId, userId, deps.prisma);
  await deps.prisma.articleProject.deleteMany({ where: { articleId, projectId } });
}

export async function listLibraryArticlesNotInProject(
  userId: string,
  projectId: string,
  deps: { prisma: PrismaClient }
) {
  return deps.prisma.article.findMany({
    where: {
      userId,
      stage: 'LIBRARY',
      projects: { none: { projectId } },
    },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, year: true },
  });
}
