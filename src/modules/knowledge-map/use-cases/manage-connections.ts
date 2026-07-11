import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { ManualConnectionType } from '@/modules/knowledge-map/domain/entities';

async function ensureNode(articleId: string, userId: string, prisma: PrismaClient) {
  return prisma.knowledgeMapNode.upsert({
    where: { articleId },
    update: {},
    create: { userId, articleId },
  });
}

export async function createManualConnection(
  input: {
    userId: string;
    sourceArticleId: string;
    targetArticleId: string;
    connectionType: ManualConnectionType;
    note?: string;
  },
  deps: { prisma: PrismaClient }
) {
  if (input.sourceArticleId === input.targetArticleId) {
    throw new ValidationError('Escolha dois artigos diferentes');
  }

  const [sourceArticle, targetArticle] = await Promise.all([
    deps.prisma.article.findFirst({ where: { id: input.sourceArticleId, userId: input.userId } }),
    deps.prisma.article.findFirst({ where: { id: input.targetArticleId, userId: input.userId } }),
  ]);
  if (!sourceArticle || !targetArticle) throw new NotFoundError('Artigo não encontrado');

  const [sourceNode, targetNode] = await Promise.all([
    ensureNode(input.sourceArticleId, input.userId, deps.prisma),
    ensureNode(input.targetArticleId, input.userId, deps.prisma),
  ]);

  return deps.prisma.knowledgeMapEdge.create({
    data: {
      userId: input.userId,
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      connectionType: input.connectionType,
      origin: 'MANUAL',
      note: input.note || null,
    },
  });
}

export async function deleteManualConnection(edgeId: string, userId: string, deps: { prisma: PrismaClient }) {
  const edge = await deps.prisma.knowledgeMapEdge.findFirst({ where: { id: edgeId, userId } });
  if (!edge) throw new NotFoundError('Conexão não encontrada');
  await deps.prisma.knowledgeMapEdge.delete({ where: { id: edgeId } });
}

export async function listArticlesForPicker(userId: string, deps: { prisma: PrismaClient }) {
  return deps.prisma.article.findMany({
    where: { userId, stage: 'LIBRARY' },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, year: true },
  });
}
