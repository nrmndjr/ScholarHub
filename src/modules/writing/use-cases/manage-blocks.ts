import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { WritingBlockType } from '../domain/entities';

async function assertDocumentOwnership(documentId: string, userId: string, prisma: PrismaClient) {
  const doc = await prisma.writingDocument.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new NotFoundError('Documento não encontrado');
}

export async function addTextBlock(
  documentId: string,
  userId: string,
  textContent: string,
  deps: { prisma: PrismaClient }
) {
  await assertDocumentOwnership(documentId, userId, deps.prisma);
  const count = await deps.prisma.writingBlock.count({ where: { documentId } });

  return deps.prisma.writingBlock.create({
    data: { documentId, userId, order: count, blockType: 'TEXT', textContent },
  });
}

export async function addReferenceBlock(
  documentId: string,
  userId: string,
  input:
    | { blockType: 'HIGHLIGHT_REF'; highlightId: string }
    | { blockType: 'COMMENT_REF'; commentId: string }
    | { blockType: 'SUMMARY_REF'; articleId: string }
    | { blockType: 'CITATION_REF'; articleId: string },
  deps: { prisma: PrismaClient }
) {
  await assertDocumentOwnership(documentId, userId, deps.prisma);

  let articleId: string;
  let highlightId: string | undefined;
  let commentId: string | undefined;

  if (input.blockType === 'HIGHLIGHT_REF') {
    const highlight = await deps.prisma.highlight.findFirst({ where: { id: input.highlightId, userId } });
    if (!highlight) throw new NotFoundError('Destaque não encontrado');
    articleId = highlight.articleId;
    highlightId = highlight.id;
  } else if (input.blockType === 'COMMENT_REF') {
    const comment = await deps.prisma.comment.findFirst({ where: { id: input.commentId, userId } });
    if (!comment) throw new NotFoundError('Comentário não encontrado');
    articleId = comment.articleId;
    commentId = comment.id;
  } else {
    const article = await deps.prisma.article.findFirst({ where: { id: input.articleId, userId } });
    if (!article) throw new NotFoundError('Artigo não encontrado');
    articleId = article.id;
  }

  const count = await deps.prisma.writingBlock.count({ where: { documentId } });

  return deps.prisma.writingBlock.create({
    data: {
      documentId,
      userId,
      order: count,
      blockType: input.blockType as WritingBlockType,
      articleId,
      highlightId,
      commentId,
    },
  });
}

export async function updateBlockText(
  blockId: string,
  userId: string,
  textContent: string,
  deps: { prisma: PrismaClient }
) {
  const block = await deps.prisma.writingBlock.findFirst({ where: { id: blockId, userId } });
  if (!block) throw new NotFoundError('Bloco não encontrado');
  if (block.blockType !== 'TEXT') throw new ValidationError('Apenas blocos de texto podem ser editados');

  await deps.prisma.writingBlock.update({ where: { id: blockId }, data: { textContent } });
}

export async function deleteBlock(blockId: string, userId: string, deps: { prisma: PrismaClient }) {
  const block = await deps.prisma.writingBlock.findFirst({ where: { id: blockId, userId } });
  if (!block) throw new NotFoundError('Bloco não encontrado');

  await deps.prisma.writingBlock.delete({ where: { id: blockId } });
}

export async function reorderBlocks(
  documentId: string,
  userId: string,
  orderedBlockIds: string[],
  deps: { prisma: PrismaClient }
) {
  await assertDocumentOwnership(documentId, userId, deps.prisma);

  await deps.prisma.$transaction(
    orderedBlockIds.map((blockId, index) =>
      deps.prisma.writingBlock.updateMany({ where: { id: blockId, documentId }, data: { order: index } })
    )
  );
}
