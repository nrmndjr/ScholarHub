import { getDocumentProxy, getMeta, extractText } from 'unpdf';

export interface PdfTextExtractionResult {
  totalPages: number;
  /** Text of the first pages, in order, used for metadata heuristics. */
  leadingPagesText: string;
  /** PDF Info dictionary (Title/Author/etc.), when present. */
  info: Record<string, unknown>;
}

const LEADING_PAGES_TO_SCAN = 2;

export async function extractPdfText(buffer: Buffer): Promise<PdfTextExtractionResult> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { info } = await getMeta(pdf);
  const { totalPages, text } = await extractText(pdf, { mergePages: false });

  const leadingPagesText = text.slice(0, LEADING_PAGES_TO_SCAN).join('\n');

  return { totalPages, leadingPagesText, info };
}

/** Per-page text, used to power in-reader search (jump to page containing a term). */
export async function extractAllPagesText(buffer: Buffer): Promise<string[]> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: false });
  return text;
}
