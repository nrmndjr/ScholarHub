import { notFound } from 'next/navigation';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { extractAllPagesText } from '@/modules/processing/infra/pdf-text-extractor';
import { ArticleWorkspace } from './_components/ArticleWorkspace';
import type { ArticleData, HighlightItem, CommentItem } from './_components/types';
import type { HighlightColor, HighlightPositionData } from '@/modules/highlights/domain/entities';

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function ArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  const user = await getCurrentUserOrThrow();

  const article = await prisma.article.findFirst({
    where: { id: articleId, userId: user.id },
    include: {
      file: true,
      journal: true,
      authors: { include: { author: true }, orderBy: { position: 'asc' } },
    },
  });

  if (!article || !article.file) notFound();

  const [highlightRows, commentRows] = await Promise.all([
    prisma.highlight.findMany({
      where: { articleId },
      include: { comments: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.comment.findMany({
      where: { articleId },
      include: { highlight: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  let pageTexts: string[] = [];
  try {
    const storage = getStorage();
    const ref = { provider: article.file.storageProvider as 'local' | 'google_drive', key: article.file.storageKey };
    const buffer = await streamToBuffer(await storage.getStream(ref));
    pageTexts = await extractAllPagesText(buffer);
  } catch {
    pageTexts = [];
  }

  const articleData: ArticleData = {
    id: article.id,
    title: article.title,
    authors: article.authors.map((a) => a.author.name),
    year: article.year,
    journal: article.journal?.name ?? null,
    volume: article.volume,
    issue: article.issue,
    pages: article.pages,
    doi: article.doi,
    url: article.url,
    currentPage: article.currentPage,
    totalPages: article.totalPages,
    summaryContent: article.summaryContent,
    fileUrl: `/api/articles/${article.id}/file`,
  };

  const highlights: HighlightItem[] = highlightRows.map((h) => ({
    id: h.id,
    color: h.color as HighlightColor,
    page: h.page,
    excerptText: h.excerptText,
    positionData: h.positionData as unknown as HighlightPositionData,
    createdAt: h.createdAt.toISOString(),
    comment: h.comments[0] ? { id: h.comments[0].id, body: h.comments[0].body } : null,
  }));

  const comments: CommentItem[] = commentRows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    highlightId: c.highlightId,
    highlightColor: (c.highlight?.color as HighlightColor) ?? null,
    highlightPage: c.highlight?.page ?? null,
    highlightExcerpt: c.highlight?.excerptText ?? null,
  }));

  return (
    <ArticleWorkspace article={articleData} highlights={highlights} comments={comments} pageTexts={pageTexts} />
  );
}
