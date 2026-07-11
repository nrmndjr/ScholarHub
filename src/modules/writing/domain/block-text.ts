import type { WritingBlockData } from './entities';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getBlockPlainText(block: WritingBlockData): string {
  switch (block.blockType) {
    case 'TEXT':
      return stripHtml(block.textContent ?? '');
    case 'HIGHLIGHT_REF':
      return block.excerptText ?? '';
    case 'COMMENT_REF':
      return block.commentText ?? '';
    case 'SUMMARY_REF':
      return block.summaryText ?? '';
    case 'CITATION_REF':
      return block.citationPlainText ?? '';
  }
}

export function getDocumentWordAndCharCount(blocks: WritingBlockData[]): { words: number; chars: number } {
  const fullText = blocks
    .map(getBlockPlainText)
    .filter(Boolean)
    .join(' ');
  const trimmed = fullText.trim();
  return {
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    chars: trimmed.length,
  };
}
