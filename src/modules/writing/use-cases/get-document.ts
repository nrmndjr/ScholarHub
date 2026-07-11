import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import { tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';
import { formatArticleAbnt } from '@/modules/reference-formatting/abnt';
import type { WritingBlockData, WritingBlockType, WritingBlockSourceMeta } from '../domain/entities';

export interface WritingDocumentDetail {
  id: string;
  title: string;
  projectId: string | null;
  blocks: WritingBlockData[];
}

export async function getWritingDocument(
  documentId: string,
  userId: string,
  deps: { prisma: PrismaClient }
): Promise<WritingDocumentDetail> {
  const document = await deps.prisma.writingDocument.findFirst({
    where: { id: documentId, userId },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
        include: {
          article: {
            include: {
              authors: { orderBy: { position: 'asc' }, include: { author: true } },
              projects: { include: { project: true } },
              journal: true,
            },
          },
          highlight: true,
          comment: true,
        },
      },
    },
  });

  if (!document) throw new NotFoundError('Documento não encontrado');

  const blocks: WritingBlockData[] = document.blocks.map((block) => {
    const source: WritingBlockSourceMeta | null = block.article
      ? {
          articleId: block.article.id,
          articleTitle: block.article.title,
          authors: block.article.authors.map((a) => a.author.name),
          year: block.article.year,
          projects: block.article.projects.map((p) => p.project.name),
          page: block.highlight?.page ?? null,
        }
      : null;

    const summaryText =
      block.blockType === 'SUMMARY_REF' && block.article?.summaryContent
        ? tiptapToPlainText(block.article.summaryContent)
        : null;

    const citationPlainText =
      block.blockType === 'CITATION_REF' && block.article
        ? formatArticleAbnt({
            title: block.article.title,
            authors: block.article.authors.map((a) => a.author.name),
            journalName: block.article.journal?.name ?? null,
            year: block.article.year,
            volume: block.article.volume,
            issue: block.article.issue,
            pages: block.article.pages,
            doi: block.article.doi,
            url: block.article.url,
          }).plainText
        : null;

    return {
      id: block.id,
      order: block.order,
      blockType: block.blockType as WritingBlockType,
      textContent: block.textContent,
      source,
      highlightColor: block.highlight?.color ?? null,
      excerptText: block.highlight?.excerptText ?? null,
      commentText: block.comment ? tiptapToPlainText(block.comment.body) : null,
      summaryText,
      citationPlainText,
    };
  });

  return { id: document.id, title: document.title, projectId: document.projectId, blocks };
}
