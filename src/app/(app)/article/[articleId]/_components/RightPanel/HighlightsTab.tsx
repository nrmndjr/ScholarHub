'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { TagMultiSelect, type TagOption } from '@/components/ui/TagMultiSelect';
import { HIGHLIGHT_COLORS, HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { deleteHighlightAction, setHighlightTagsAction, createTagAction } from '../../actions';
import { tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';
import type { HighlightItem } from '../types';

export function HighlightsTab({
  articleId,
  highlights,
  availableTags,
  onJumpToPage,
}: {
  articleId: string;
  highlights: HighlightItem[];
  availableTags: TagOption[];
  onJumpToPage: (page: number) => void;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTagsFor, setEditingTagsFor] = useState<HighlightItem | null>(null);
  const [tags, setTags] = useState(availableTags);

  const grouped = useMemo(() => {
    const map = new Map<HighlightColor, HighlightItem[]>();
    for (const color of HIGHLIGHT_COLORS) map.set(color, []);
    for (const h of highlights) map.get(h.color)?.push(h);
    return map;
  }, [highlights]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteHighlightAction(articleId, id);
    } catch {
      toast.error('Erro ao excluir destaque');
    } finally {
      setDeletingId(null);
    }
  }

  if (highlights.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-400">Nenhum destaque ainda. Selecione um trecho no PDF para começar.</p>;
  }

  return (
    <div className="space-y-5">
      {HIGHLIGHT_COLORS.map((color) => {
        const items = grouped.get(color) ?? [];
        if (items.length === 0) return null;
        const meta = HIGHLIGHT_COLOR_META[color];

        return (
          <div key={color}>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
              <span>{meta.emoji}</span>
              {meta.label}
              <span className="text-neutral-300">({items.length})</span>
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 p-2.5 text-sm dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => onJumpToPage(item.page)}
                    className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    Página {item.page}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <p className="line-clamp-3 text-neutral-700 dark:text-neutral-300">{item.excerptText}</p>
                  {item.comment && (
                    <p className="mt-1 border-l-2 border-neutral-200 pl-2 text-xs italic text-neutral-500 dark:border-neutral-700">
                      {tiptapToPlainText(item.comment.body)}
                    </p>
                  )}
                  {item.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.excerptText);
                        toast.success('Trecho copiado');
                      }}
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTagsFor(item)}
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      <TagIcon className="h-3 w-3" />
                      Tags
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {editingTagsFor && (
        <Dialog open={!!editingTagsFor} onOpenChange={(open) => !open && setEditingTagsFor(null)} title="Tags do destaque" className="max-w-md">
          <div className="space-y-3">
            <p className="line-clamp-3 rounded-lg bg-neutral-50 p-2 text-xs italic text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              &ldquo;{editingTagsFor.excerptText}&rdquo;
            </p>
            <TagMultiSelect
              allTags={tags}
              selectedIds={editingTagsFor.tags.map((t) => t.id)}
              onChange={async (tagIds) => {
                setEditingTagsFor({ ...editingTagsFor, tags: tags.filter((t) => tagIds.includes(t.id)) });
                await setHighlightTagsAction(articleId, editingTagsFor.id, tagIds);
                router.refresh();
              }}
              onCreateTag={async (name) => {
                const tag = await createTagAction(name);
                setTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
                return tag;
              }}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
