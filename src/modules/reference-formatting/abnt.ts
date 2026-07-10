export interface AbntArticleInput {
  title: string;
  authors: string[];
  journalName?: string | null;
  year?: number | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  url?: string | null;
}

export interface AbntSegment {
  text: string;
  italic?: boolean;
}

export interface AbntReference {
  plainText: string;
  segments: AbntSegment[];
}

function formatAuthorAbnt(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].toUpperCase();

  // Last word is treated as the family name; everything before it (including
  // connectors like "da"/"de"/"von") stays as the given name, e.g.
  // "Maria da Silva" -> "SILVA, Maria da" — the ABNT-conventional placement.
  const surname = parts[parts.length - 1].toUpperCase();
  const given = parts.slice(0, -1).join(' ');
  return `${surname}, ${given}`;
}

function formatAuthorsAbnt(authors: string[]): string {
  return authors
    .map((a) => formatAuthorAbnt(a))
    .filter(Boolean)
    .join('; ');
}

function toSentenceCase(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return trimmed;
  return trimmed[0].toUpperCase() + trimmed.slice(1);
}

export function formatArticleAbnt(input: AbntArticleInput): AbntReference {
  const segments: AbntSegment[] = [];
  const push = (text: string, italic = false) => {
    if (text) segments.push({ text, italic });
  };

  const authorsText = formatAuthorsAbnt(input.authors);
  push(authorsText ? `${authorsText}. ` : '');

  push(`${toSentenceCase(input.title)}. `);

  if (input.journalName) {
    push(`${input.journalName}`, true);
    push(', ');
  }

  const volIssueParts: string[] = [];
  if (input.volume) volIssueParts.push(`v. ${input.volume}`);
  if (input.issue) volIssueParts.push(`n. ${input.issue}`);
  if (input.pages) volIssueParts.push(`p. ${input.pages}`);
  if (volIssueParts.length > 0) push(`${volIssueParts.join(', ')}, `);

  if (input.year) push(`${input.year}.`);
  else if (segments.length > 0 && segments[segments.length - 1].text.endsWith(', ')) {
    // avoid a dangling ", " with nothing after it
    segments[segments.length - 1].text = segments[segments.length - 1].text.trimEnd().replace(/,$/, '.');
  }

  if (input.doi) push(` DOI: ${input.doi}.`);

  if (input.url && !input.pages) {
    const today = new Date();
    const accessDate = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    push(` Disponível em: ${input.url}. Acesso em: ${accessDate}.`);
  }

  const plainText = segments
    .map((s) => s.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

  return { plainText, segments };
}
