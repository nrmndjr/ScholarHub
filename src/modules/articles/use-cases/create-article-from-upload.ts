import type { PrismaClient } from '@/generated/prisma/client';
import type { Storage } from '@/lib/storage/storage.interface';
import { ValidationError } from '@/lib/errors';

const ACCEPTED_MIME_TYPES = new Set(['application/pdf']);
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

function stripExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}

export async function createArticleFromUpload(
  input: { userId: string; filename: string; buffer: Buffer; mimeType: string },
  deps: { prisma: PrismaClient; storage: Storage }
) {
  if (!ACCEPTED_MIME_TYPES.has(input.mimeType)) {
    throw new ValidationError('Apenas arquivos PDF são aceitos');
  }
  if (input.buffer.byteLength === 0) {
    throw new ValidationError('Arquivo vazio');
  }
  if (input.buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError('Arquivo excede o limite de 50MB');
  }

  const article = await deps.prisma.article.create({
    data: {
      userId: input.userId,
      title: stripExtension(input.filename),
      stage: 'INBOX',
      status: 'NAO_INICIADO',
    },
  });

  const ref = await deps.storage.save({
    userId: input.userId,
    articleId: article.id,
    filename: input.filename,
    buffer: input.buffer,
    mimeType: input.mimeType,
  });

  await deps.prisma.file.create({
    data: {
      articleId: article.id,
      storageProvider: ref.provider,
      storageKey: ref.key,
      originalFilename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.byteLength,
    },
  });

  await deps.prisma.processingJob.create({
    data: {
      articleId: article.id,
      type: 'EXTRACT_METADATA',
      status: 'PENDING',
    },
  });

  return article;
}
