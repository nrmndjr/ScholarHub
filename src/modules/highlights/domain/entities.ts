export const HIGHLIGHT_COLORS = [
  'CONCEITO_IMPORTANTE',
  'METODOLOGIA',
  'CITACAO',
  'RESULTADO',
  'CRITICA',
  'COMENTARIO',
] as const;

export type HighlightColor = (typeof HIGHLIGHT_COLORS)[number];

export const HIGHLIGHT_COLOR_META: Record<HighlightColor, { label: string; emoji: string; cssVar: string }> = {
  CONCEITO_IMPORTANTE: { label: 'Conceito importante', emoji: '🟨', cssVar: 'var(--color-highlight-conceito)' },
  METODOLOGIA: { label: 'Metodologia', emoji: '🟩', cssVar: 'var(--color-highlight-metodologia)' },
  CITACAO: { label: 'Citação', emoji: '🟦', cssVar: 'var(--color-highlight-citacao)' },
  RESULTADO: { label: 'Resultado', emoji: '🟪', cssVar: 'var(--color-highlight-resultado)' },
  CRITICA: { label: 'Crítica', emoji: '🟥', cssVar: 'var(--color-highlight-critica)' },
  COMENTARIO: { label: 'Comentário', emoji: '💬', cssVar: 'var(--color-highlight-comentario)' },
};

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HighlightPositionData {
  rects: HighlightRect[];
}
