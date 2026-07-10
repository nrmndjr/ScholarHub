import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import { updateArticleMetadataSchema, type UpdateArticleMetadataInput } from '@/lib/validation/article.schema';
import { calculateCompletenessScore } from '@/modules/articles/domain/entities';
import { setArticleAuthors, setArticleJournal } from '@/modules/articles/use-cases/link-authors-and-journal';

export async function updateArticleMetadata(
  articleId: string,
  userId: string,
  rawInput: UpdateArticleMetadataInput,
  deps: { prisma: PrismaClient }
) {
  const input = updateArticleMetadataSchema.parse(rawInput);

  const article = await deps.prisma.article.findFirst({ where: { id: articleId, userId } });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  const completenessScore = calculateCompletenessScore({
    title: input.title,
    authors: input.authors,
    year: input.year,
    doi: input.doi,
    journal: input.journal,
    abstractText: input.abstractText,
    keywords: input.keywords,
  });

  await deps.prisma.article.update({
    where: { id: articleId },
    data: {
      title: input.title,
      year: input.year,
      doi: input.doi || null,
      url: input.url || null,
      abstractText: input.abstractText || null,
      keywords: input.keywords,
      completenessScore,
    },
  });

  await setArticleAuthors(articleId, input.authors, { prisma: deps.prisma });

  if (input.journal) {
    await setArticleJournal(articleId, input.journal, { prisma: deps.prisma });
  } else {
    await deps.prisma.article.update({ where: { id: articleId }, data: { journalId: null } });
  }
}
