import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import type { HighlightColor, HighlightPositionData } from '@/modules/highlights/domain/entities';

export async function createHighlight(
  input: {
    userId: string;
    articleId: string;
    color: HighlightColor;
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
  },
  deps: { prisma: PrismaClient }
) {
  const article = await deps.prisma.article.findFirst({ where: { id: input.articleId, userId: input.userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  return deps.prisma.highlight.create({
    data: {
      userId: input.userId,
      articleId: input.articleId,
      color: input.color,
      page: input.page,
      excerptText: input.excerptText,
      positionData: input.positionData as object,
    },
  });
}
