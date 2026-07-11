import { parseHtmlToParagraphs, type TextRun } from './rich-text-parser';
import type { WritingBlockData, WritingBlockSourceMeta } from './entities';

export interface ExportSection {
  paragraphs: TextRun[][];
  sourceMeta: string | null;
}

function formatSourceMeta(source: WritingBlockSourceMeta | null): string | null {
  if (!source) return null;
  const parts = [
    source.authors.length > 0 ? source.authors.join(', ') : null,
    source.year ? String(source.year) : null,
    source.page ? `p. ${source.page}` : null,
    source.projects.length > 0 ? source.projects.join(', ') : null,
  ].filter(Boolean);
  return [source.articleTitle, ...parts].join(' · ');
}

function plainParagraphs(text: string, italic = false): TextRun[][] {
  if (!text.trim()) return [];
  return [[{ text, bold: false, italic }]];
}

export function buildExportSections(blocks: WritingBlockData[]): ExportSection[] {
  return blocks
    .map((block): ExportSection => {
      switch (block.blockType) {
        case 'TEXT':
          return { paragraphs: parseHtmlToParagraphs(block.textContent ?? ''), sourceMeta: null };
        case 'HIGHLIGHT_REF':
          return {
            paragraphs: plainParagraphs(`"${block.excerptText ?? ''}"`, true),
            sourceMeta: formatSourceMeta(block.source),
          };
        case 'COMMENT_REF':
          return { paragraphs: plainParagraphs(block.commentText ?? ''), sourceMeta: formatSourceMeta(block.source) };
        case 'SUMMARY_REF':
          return {
            paragraphs: plainParagraphs(block.summaryText || 'Sem resumo pessoal ainda.'),
            sourceMeta: formatSourceMeta(block.source),
          };
        case 'CITATION_REF':
          return { paragraphs: plainParagraphs(block.citationPlainText ?? ''), sourceMeta: null };
      }
    })
    .filter((section) => section.paragraphs.length > 0);
}
