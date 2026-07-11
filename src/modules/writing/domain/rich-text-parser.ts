export interface TextRun {
  text: string;
  bold: boolean;
  italic: boolean;
}

// TEXT blocks store HTML produced by the block editor (RichTextBlockEditor), restricted
// to <p>/<strong>/<em>/<br> — parsed here into per-paragraph runs for document export.
export function parseHtmlToParagraphs(html: string): TextRun[][] {
  if (!html.trim() || typeof window === 'undefined') return [];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.body.querySelectorAll('p'));

  if (paragraphs.length === 0) {
    const text = doc.body.textContent?.trim();
    return text ? [[{ text, bold: false, italic: false }]] : [];
  }

  return paragraphs.map((p) => walkNode(p, false, false)).filter((runs) => runs.length > 0);
}

function walkNode(node: Node, bold: boolean, italic: boolean): TextRun[] {
  const runs: TextRun[] = [];
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? '';
      if (text) runs.push({ text, bold, italic });
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      runs.push(...walkNode(el, bold || tag === 'strong' || tag === 'b', italic || tag === 'em' || tag === 'i'));
    }
  });
  return runs;
}
