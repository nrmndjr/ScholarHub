export interface CrossRefWork {
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  abstractText?: string;
}

export async function lookupCrossRefByDoi(doi: string): Promise<CrossRefWork | null> {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'ScholarHub/1.0 (mailto:support@scholarhub.dev)' },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const message = json?.message;
    if (!message) return null;

    const authors: string[] = Array.isArray(message.author)
      ? message.author
          .map((a: { given?: string; family?: string }) => [a.given, a.family].filter(Boolean).join(' '))
          .filter(Boolean)
      : [];

    const year =
      message['published-print']?.['date-parts']?.[0]?.[0] ??
      message['published-online']?.['date-parts']?.[0]?.[0] ??
      undefined;

    return {
      title: Array.isArray(message.title) ? message.title[0] : undefined,
      authors: authors.length > 0 ? authors : undefined,
      journal: Array.isArray(message['container-title']) ? message['container-title'][0] : undefined,
      year,
      abstractText: typeof message.abstract === 'string' ? message.abstract.replace(/<[^>]+>/g, '') : undefined,
    };
  } catch {
    return null;
  }
}
