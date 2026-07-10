interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
}

export function tiptapToPlainText(doc: unknown): string {
  if (!doc || typeof doc !== 'object') return '';
  const node = doc as TiptapNode;

  if (node.text) return node.text;
  if (!node.content) return '';

  return node.content
    .map((child) => tiptapToPlainText(child))
    .join(node.type === 'paragraph' || node.type === 'heading' ? ' ' : '\n')
    .trim();
}

export function plainTextToTiptapDoc(text: string) {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
  };
}
