'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface TagOption {
  id: string;
  name: string;
}

export function TagMultiSelect({
  allTags,
  selectedIds,
  onChange,
  onCreateTag,
}: {
  allTags: TagOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreateTag: (name: string) => Promise<TagOption>;
}) {
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const selected = new Set(selectedIds);

  function toggle(tagId: string) {
    const next = new Set(selected);
    if (next.has(tagId)) next.delete(tagId);
    else next.add(tagId);
    onChange(Array.from(next));
  }

  async function handleCreate() {
    const name = newTagName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const tag = await onCreateTag(name);
      setNewTagName('');
      onChange(Array.from(new Set([...selected, tag.id])));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {allTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
              selected.has(tag.id)
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-400'
            )}
          >
            {tag.name}
          </button>
        ))}
        {allTags.length === 0 && <p className="text-xs text-neutral-400">Nenhuma tag criada ainda.</p>}
      </div>
      <div className="flex gap-2">
        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder="Nova tag"
          className="h-8 flex-1 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        />
        <Button type="button" size="sm" variant="secondary" disabled={creating || !newTagName.trim()} onClick={handleCreate}>
          Criar
        </Button>
      </div>
    </div>
  );
}
