import type { PrismaClient } from '@/generated/prisma/client';
import type { Storage } from '@/lib/storage/storage.interface';
import { extractPdfText } from '@/modules/processing/infra/pdf-text-extractor';
import { extractMetadataFromText } from '@/modules/processing/use-cases/extract-pdf-metadata';
import { lookupCrossRefByDoi } from '@/modules/processing/infra/crossref-client';
import { calculateCompletenessScore, type ExtractedMetadata } from '@/modules/articles/domain/entities';
import { setArticleAuthors, setArticleJournal } from '@/modules/articles/use-cases/link-authors-and-journal';

const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 3;

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function mergeEmptyFields(base: ExtractedMetadata, enrichment: ExtractedMetadata): ExtractedMetadata {
  return {
    title: base.title ?? enrichment.title,
    authors: base.authors && base.authors.length > 0 ? base.authors : enrichment.authors,
    year: base.year ?? enrichment.year,
    doi: base.doi ?? enrichment.doi,
    journal: base.journal ?? enrichment.journal,
    abstractText: base.abstractText ?? enrichment.abstractText,
    keywords: base.keywords && base.keywords.length > 0 ? base.keywords : enrichment.keywords,
  };
}

async function runExtractMetadataJob(
  job: { id: string; articleId: string },
  deps: { prisma: PrismaClient; storage: Storage }
) {
  const article = await deps.prisma.article.findUniqueOrThrow({
    where: { id: job.articleId },
    include: { file: true },
  });

  if (!article.file) {
    throw new Error('Article has no associated file');
  }

  const ref = { provider: article.file.storageProvider as 'local' | 'google_drive' | 'vercel_blob', key: article.file.storageKey };
  const stream = await deps.storage.getStream(ref);
  const buffer = await streamToBuffer(stream);

  const { totalPages, leadingPagesText, info } = await extractPdfText(buffer);
  let metadata = extractMetadataFromText(leadingPagesText, info);

  if (metadata.doi) {
    const enrichment = await lookupCrossRefByDoi(metadata.doi);
    if (enrichment) {
      metadata = mergeEmptyFields(metadata, enrichment);
    }
  }

  const completenessScore = calculateCompletenessScore(metadata);

  if (article.stage === 'INBOX') {
    await deps.prisma.article.update({
      where: { id: article.id },
      data: {
        title: metadata.title ?? article.title,
        year: metadata.year ?? article.year,
        doi: metadata.doi ?? article.doi,
        abstractText: metadata.abstractText ?? article.abstractText,
        keywords: metadata.keywords ?? article.keywords ?? undefined,
        totalPages,
        completenessScore,
      },
    });

    if (metadata.authors && metadata.authors.length > 0) {
      await setArticleAuthors(article.id, metadata.authors, { prisma: deps.prisma });
    }
    if (metadata.journal) {
      await setArticleJournal(article.id, metadata.journal, { prisma: deps.prisma });
    }
  } else {
    await deps.prisma.article.update({ where: { id: article.id }, data: { totalPages } });
  }

  return { metadata, completenessScore };
}

export async function processPendingJobs(deps: { prisma: PrismaClient; storage: Storage }) {
  const candidates = await deps.prisma.processingJob.findMany({
    where: { OR: [{ status: 'PENDING' }, { status: 'FAILED', attempts: { lt: MAX_ATTEMPTS } }] },
    orderBy: { createdAt: 'asc' },
    take: BATCH_SIZE,
  });

  if (candidates.length === 0) return { processed: 0 };

  await deps.prisma.processingJob.updateMany({
    where: { id: { in: candidates.map((c) => c.id) } },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  for (const job of candidates) {
    try {
      const result =
        job.type === 'EXTRACT_METADATA'
          ? await runExtractMetadataJob(job, deps)
          : (() => {
              throw new Error(`Unsupported job type: ${job.type}`);
            })();

      await deps.prisma.processingJob.update({
        where: { id: job.id },
        data: { status: 'SUCCEEDED', finishedAt: new Date(), result: result as object },
      });
    } catch (error) {
      await deps.prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : String(error),
          finishedAt: new Date(),
        },
      });
    }
  }

  return { processed: candidates.length };
}
