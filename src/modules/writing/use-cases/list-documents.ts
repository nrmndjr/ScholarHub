import type { PrismaClient } from '@/generated/prisma/client';
import type { WritingDocumentSummary } from '../domain/entities';

export async function listWritingDocuments(
  userId: string,
  deps: { prisma: PrismaClient }
): Promise<WritingDocumentSummary[]> {
  const documents = await deps.prisma.writingDocument.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: { project: true, _count: { select: { blocks: true } } },
  });

  return documents.map((doc) => ({
    id: doc.id,
    title: doc.title,
    projectId: doc.projectId,
    projectName: doc.project?.name ?? null,
    blockCount: doc._count.blocks,
    updatedAt: doc.updatedAt.toISOString(),
  }));
}
