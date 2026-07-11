import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function createWritingDocument(
  userId: string,
  input: { title: string; projectId?: string | null },
  deps: { prisma: PrismaClient }
) {
  return deps.prisma.writingDocument.create({
    data: { userId, title: input.title.trim() || 'Documento sem título', projectId: input.projectId || null },
  });
}

export async function renameWritingDocument(
  documentId: string,
  userId: string,
  title: string,
  deps: { prisma: PrismaClient }
) {
  const doc = await deps.prisma.writingDocument.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new NotFoundError('Documento não encontrado');

  await deps.prisma.writingDocument.update({
    where: { id: documentId },
    data: { title: title.trim() || doc.title },
  });
}

export async function deleteWritingDocument(documentId: string, userId: string, deps: { prisma: PrismaClient }) {
  const doc = await deps.prisma.writingDocument.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new NotFoundError('Documento não encontrado');

  await deps.prisma.writingDocument.delete({ where: { id: documentId } });
}
