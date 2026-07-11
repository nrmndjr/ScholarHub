'use client';

import Link from 'next/link';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { RichTextBlockEditor } from './RichTextBlockEditor';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { WRITING_BLOCK_TYPE_LABELS, type WritingBlockData } from '@/modules/writing/domain/entities';
import { updateBlockTextAction, deleteBlockAction } from '../actions';

const TYPE_BADGE_COLOR: Record<string, string> = {
  TEXT: '#737373',
  HIGHLIGHT_REF: '#6366f1',
  COMMENT_REF: '#14b8a6',
  SUMMARY_REF: '#0ea5e9',
  CITATION_REF: '#a855f7',
};

function SourceMeta({ block }: { block: WritingBlockData }) {
  if (!block.source) return null;
  const { articleTitle, authors, year, projects, page } = block.source;
  const parts = [
    authors.length > 0 ? authors.join(', ') : null,
    year ? String(year) : null,
    page ? `p. ${page}` : null,
    projects.length > 0 ? projects.join(', ') : null,
  ].filter(Boolean);

  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
      <Link
        href={`/article/${block.source.articleId}${page ? `?page=${page}` : ''}`}
        className="inline-flex items-center gap-1 truncate font-medium hover:text-accent"
        title={`Abrir "${articleTitle}" no artigo original`}
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">{articleTitle}</span>
      </Link>
      {parts.length > 0 && <span className="shrink-0 text-neutral-400">· {parts.join(' · ')}</span>}
    </div>
  );
}

export function BlockCard({
  block,
  documentId,
  onTextChange,
}: {
  block: WritingBlockData;
  documentId: string;
  onTextChange?: (blockId: string, html: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  async function handleDelete() {
    if (!confirm('Remover este bloco?')) return;
    await deleteBlockAction(documentId, block.id);
  }

  async function handleCopyCitation() {
    if (!block.citationPlainText) return;
    await navigator.clipboard.writeText(block.citationPlainText);
    toast.success('Referência copiada');
  }

  const highlightMeta = block.highlightColor ? HIGHLIGHT_COLOR_META[block.highlightColor as HighlightColor] : null;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="group p-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-1 text-neutral-300 hover:bg-neutral-100 active:cursor-grabbing dark:text-neutral-700 dark:hover:bg-neutral-800"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                style={{ backgroundColor: highlightMeta?.cssVar ?? TYPE_BADGE_COLOR[block.blockType] }}
              >
                {highlightMeta ? `${highlightMeta.emoji} ${highlightMeta.label}` : WRITING_BLOCK_TYPE_LABELS[block.blockType]}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                {block.blockType === 'CITATION_REF' && (
                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-accent dark:hover:bg-neutral-800"
                    aria-label="Copiar referência ABNT"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                  aria-label="Remover bloco"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {block.blockType === 'TEXT' ? (
              <div className="mt-2">
                <RichTextBlockEditor
                  initialContent={block.textContent ?? ''}
                  onSave={(html) => updateBlockTextAction(block.id, html)}
                  onChange={(html) => onTextChange?.(block.id, html)}
                />
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                {block.blockType === 'HIGHLIGHT_REF' && `"${block.excerptText}"`}
                {block.blockType === 'COMMENT_REF' && block.commentText}
                {block.blockType === 'SUMMARY_REF' && (block.summaryText || 'Sem resumo pessoal ainda.')}
                {block.blockType === 'CITATION_REF' && block.citationPlainText}
              </p>
            )}

            <SourceMeta block={block} />
          </div>
        </div>
      </Card>
    </div>
  );
}
