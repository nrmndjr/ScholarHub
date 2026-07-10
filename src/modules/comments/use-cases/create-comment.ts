import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';

export async function createComment(
  input: { userId: string; articleId: string; highlightId?: string | null; body: object },
  deps: { prisma: PrismaClient }
) {
  const article = await deps.prisma.article.findFirst({ where: { id: input.articleId, userId: input.userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  return deps.prisma.comment.create({
    data: {
      userId: input.userId,
      articleId: input.articleId,
      highlightId: input.highlightId ?? null,
      body: input.body,
    },
  });
}
