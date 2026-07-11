'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TagMultiSelect, type TagOption } from '@/components/ui/TagMultiSelect';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { createTagAction } from '../actions';

export function HighlightAnnotationDialog({
  open,
  onOpenChange,
  color,
  excerptText,
  availableTags,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color: HighlightColor | null;
  excerptText: string;
  availableTags: TagOption[];
  onSubmit: (data: { tagIds: string[]; commentText: string }) => Promise<void>;
}) {
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [tags, setTags] = useState(availableTags);
  const [saving, setSaving] = useState(false);

  async function handleCreateTag(name: string) {
    const tag = await createTagAction(name);
    setTags((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
    return tag;
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      await onSubmit({ tagIds, commentText: commentText.trim() });
      setTagIds([]);
      setCommentText('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const meta = color ? HIGHLIGHT_COLOR_META[color] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Novo destaque" className="max-w-md">
      <div className="space-y-4">
        {meta && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {meta.emoji} {meta.label}
          </span>
        )}
        <p className="line-clamp-3 rounded-lg bg-neutral-50 p-2 text-xs italic text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          &ldquo;{excerptText}&rdquo;
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Tags temáticas (assunto do trecho)
          </label>
          <TagMultiSelect allTags={tags} selectedIds={tagIds} onChange={setTagIds} onCreateTag={handleCreateTag} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Comentário (opcional)</label>
          <Textarea rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Seu comentário..." />
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? 'Salvando...' : 'Salvar destaque'}
        </Button>
      </div>
    </Dialog>
  );
}
