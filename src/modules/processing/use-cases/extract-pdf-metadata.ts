import type { ExtractedMetadata } from '@/modules/articles/domain/entities';

const GENERIC_TITLE_PATTERNS = [/^untitled/i, /^document\d*$/i, /^microsoft word/i, /\.(docx?|pdf)$/i];

function isGenericTitle(title: string) {
  return GENERIC_TITLE_PATTERNS.some((pattern) => pattern.test(title.trim()));
}

function extractTitle(text: string, infoTitle?: string): string | undefined {
  if (infoTitle && infoTitle.trim().length > 3 && !isGenericTitle(infoTitle)) {
    return infoTitle.trim();
  }

  const beforeAbstract = text.split(/\babstract\b/i)[0] ?? text;
  const lines = beforeAbstract
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const candidate = lines.find((line) => line.length >= 10 && line.length <= 300);
  return candidate;
}

function extractAuthors(text: string): string[] | undefined {
  const abstractSplit = text.split(/\babstract\b/i);
  const introSplit = text.split(/\bintroduction\b/i);
  const headBlock = abstractSplit.length > 1 ? abstractSplit[0] : introSplit[0];

  const lines = headBlock
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Skip the first line (assumed title), scan the next few lines for an author-list-shaped line.
  const candidateLines = lines.slice(1, 6);

  for (const line of candidateLines) {
    const cleaned = line.replace(/\d+/g, '').trim();
    const parts = cleaned
      .split(/,|;|\band\b|&/i)
      .map((p) => p.trim())
      .filter(Boolean);

    const nameLike = parts.filter((p) => /^([A-ZÀ-Ý][a-zà-ÿ'’-]+\.?\s*){2,4}$/.test(p));

    if (nameLike.length > 0) {
      return nameLike;
    }
  }

  return undefined;
}

function extractYear(text: string): number | undefined {
  const nearCopyright = /©\s*(\d{4})/.exec(text);
  if (nearCopyright) return parseInt(nearCopyright[1], 10);

  const match = /\b(19|20)\d{2}\b/.exec(text);
  return match ? parseInt(match[0], 10) : undefined;
}

function extractDoi(text: string): string | undefined {
  const match = /\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/.exec(text);
  return match?.[0].replace(/[.,;]+$/, '');
}

function extractAbstract(text: string): string | undefined {
  const match = /\babstract\b[:\s]*([\s\S]*?)(\bkeywords?\b|\bintroduction\b|\b1\.\s|$)/i.exec(text);
  const content = match?.[1]?.trim();
  if (!content || content.length < 20) return undefined;
  return content.slice(0, 2000);
}

function extractKeywords(text: string): string[] | undefined {
  const match = /\bkeywords?\s*[:\-]\s*(.+)/i.exec(text);
  if (!match) return undefined;
  const line = match[1].split('\n')[0];
  const keywords = line
    .split(/[;,]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 1 && k.length < 60);
  return keywords.length > 0 ? keywords : undefined;
}

export function extractMetadataFromText(
  leadingPagesText: string,
  info: Record<string, unknown>
): ExtractedMetadata {
  const infoTitle = typeof info.Title === 'string' ? info.Title : undefined;

  return {
    title: extractTitle(leadingPagesText, infoTitle),
    authors: extractAuthors(leadingPagesText),
    year: extractYear(leadingPagesText),
    doi: extractDoi(leadingPagesText),
    abstractText: extractAbstract(leadingPagesText),
    keywords: extractKeywords(leadingPagesText),
  };
}
