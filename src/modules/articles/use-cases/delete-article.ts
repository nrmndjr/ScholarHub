import type { PrismaClient } from '@/generated/prisma/client';
import type { Storage } from '@/lib/storage/storage.interface';
import { NotFoundError } from '@/lib/errors';

export async function deleteArticle(
  articleId: string,
  userId: string,
  deps: { prisma: PrismaClient; storage: Storage }
) {
  const article = await deps.prisma.article.findFirst({
    where: { id: articleId, userId },
    include: { file: true },
  });
  if (!article) throw new NotFoundError('Artigo não encontrado');

  if (article.file) {
    try {
      await deps.storage.delete({
        provider: article.file.storageProvider as 'local' | 'google_drive' | 'vercel_blob',
        key: article.file.storageKey,
      });
    } catch (error) {
      // Don't let a storage hiccup block the user from cleaning up their library -
      // the DB row (and the orphaned blob, if any) can be dealt with separately.
      console.error('[delete-article] failed to delete underlying file', error);
    }
  }

  await deps.prisma.article.delete({ where: { id: articleId } });
}
