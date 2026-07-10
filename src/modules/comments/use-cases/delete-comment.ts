import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function deleteComment(commentId: string, userId: string, deps: { prisma: PrismaClient }) {
  const comment = await deps.prisma.comment.findFirst({ where: { id: commentId, userId } });
  if (!comment) throw new NotFoundError('Comentário não encontrado');

  await deps.prisma.comment.delete({ where: { id: commentId } });
}
