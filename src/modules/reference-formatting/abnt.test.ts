import { describe, expect, it } from 'vitest';
import { formatArticleAbnt } from './abnt';

describe('formatArticleAbnt', () => {
  it('formats a complete reference with all fields', () => {
    const { plainText } = formatArticleAbnt({
      title: 'Deep learning',
      authors: ['Yann LeCun', 'Yoshua Bengio', 'Geoffrey Hinton'],
      journalName: 'Nature',
      year: 2015,
      volume: '521',
      issue: '7553',
      pages: '436-444',
      doi: '10.1038/nature14539',
    });

    expect(plainText).toBe(
      'LECUN, Yann; BENGIO, Yoshua; HINTON, Geoffrey. Deep learning. Nature, v. 521, n. 7553, p. 436-444, 2015. DOI: 10.1038/nature14539.'
    );
  });

  it('omits DOI gracefully without dangling punctuation', () => {
    const { plainText } = formatArticleAbnt({
      title: 'Sem DOI',
      authors: ['Maria Silva'],
      journalName: 'Revista X',
      year: 2020,
    });

    expect(plainText).toBe('SILVA, Maria. Sem DOI. Revista X, 2020.');
    expect(plainText).not.toMatch(/,\s*,/);
    expect(plainText).not.toMatch(/,\s*\./);
  });

  it('omits volume/issue when absent but keeps pages', () => {
    const { plainText } = formatArticleAbnt({
      title: 'Sem volume e número',
      authors: ['João Souza'],
      journalName: 'Revista Y',
      year: 2019,
      pages: '10-20',
    });

    expect(plainText).toBe('SOUZA, João. Sem volume e número. Revista Y, p. 10-20, 2019.');
  });

  it('omits journal entirely without leaving a dangling comma', () => {
    const { plainText } = formatArticleAbnt({
      title: 'Sem periódico',
      authors: ['Ana Costa'],
      year: 2021,
    });

    expect(plainText).toBe('COSTA, Ana. Sem periódico. 2021.');
  });

  it('handles an article with no authors and no year', () => {
    const { plainText } = formatArticleAbnt({ title: 'Apenas título', authors: [] });
    expect(plainText).toBe('Apenas título.');
  });

  it('italicizes the journal name as a distinct segment', () => {
    const { segments } = formatArticleAbnt({
      title: 'Deep learning',
      authors: ['Yann LeCun'],
      journalName: 'Nature',
      year: 2015,
    });

    const journalSegment = segments.find((s) => s.text.includes('Nature'));
    expect(journalSegment?.italic).toBe(true);
  });

  it('keeps surname particles attached when formatting an author name', () => {
    const { plainText } = formatArticleAbnt({
      title: 'Título de exemplo',
      authors: ['Maria da Silva'],
      year: 2022,
    });

    expect(plainText.startsWith('SILVA, Maria da.')).toBe(true);
  });
});
