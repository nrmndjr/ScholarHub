'use client';

import { MessageSquare, Copy } from 'lucide-react';
import { HIGHLIGHT_COLORS, HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';

export function SelectionMenu({
  x,
  y,
  onPickColor,
  onComment,
  onCopy,
}: {
  x: number;
  y: number;
  onPickColor: (color: HighlightColor) => void;
  onComment: () => void;
  onCopy: () => void;
}) {
  return (
    <div
      className="fixed z-50 flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
      style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1">
        {HIGHLIGHT_COLORS.filter((c) => c !== 'COMENTARIO').map((color) => (
          <button
            key={color}
            type="button"
            title={HIGHLIGHT_COLOR_META[color].label}
            onClick={() => onPickColor(color)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {HIGHLIGHT_COLOR_META[color].emoji}
          </button>
        ))}
        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
        <button
          type="button"
          title="Comentário"
          onClick={onComment}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <MessageSquare className="h-4 w-4 text-neutral-500" />
        </button>
        <button
          type="button"
          title="Copiar trecho"
          onClick={onCopy}
          className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Copy className="h-4 w-4 text-neutral-500" />
        </button>
      </div>
      <p className="whitespace-nowrap text-[10px] text-neutral-400">
        {HIGHLIGHT_COLOR_META.CONCEITO_IMPORTANTE.emoji} Enter para salvar rápido
      </p>
    </div>
  );
}
