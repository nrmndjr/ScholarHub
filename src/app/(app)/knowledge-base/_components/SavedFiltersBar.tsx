'use client';

import { useRef, useState } from 'react';
import { Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createSavedFilterAction, deleteSavedFilterAction } from '../actions';
import type { SavedFilterData } from '@/modules/knowledge-base/use-cases/manage-saved-filters';
import type { HighlightSearchFilters } from '@/modules/knowledge-base/domain/entities';

function hasActiveFilters(filters: HighlightSearchFilters): boolean {
  return Object.values(filters).some((v) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0));
}

export function SavedFiltersBar({
  savedFilters,
  onSavedFiltersChange,
  currentFilters,
  onApply,
}: {
  savedFilters: SavedFilterData[];
  onSavedFiltersChange: (next: SavedFilterData[]) => void;
  currentFilters: HighlightSearchFilters;
  onApply: (filters: HighlightSearchFilters) => void;
}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const saved = await createSavedFilterAction(trimmed, currentFilters);
      onSavedFiltersChange([...savedFilters, saved]);
      setName('');
      setNaming(false);
      toast.success('Filtro salvo');
    } catch {
      toast.error('Erro ao salvar filtro');
    }
  }

  async function handleDelete(id: string) {
    onSavedFiltersChange(savedFilters.filter((f) => f.id !== id));
    await deleteSavedFilterAction(id);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {savedFilters.map((saved) => (
        <div
          key={saved.id}
          className="group flex items-center gap-1 rounded-full border border-neutral-300 py-0.5 pl-2.5 pr-1 text-xs dark:border-neutral-700"
        >
          <button
            type="button"
            onClick={() => onApply(saved.filters)}
            className="flex items-center gap-1 text-neutral-600 hover:text-accent dark:text-neutral-300"
          >
            <Star className="h-3 w-3 shrink-0 fill-current text-amber-400" />
            {saved.name}
          </button>
          <button
            type="button"
            onClick={() => handleDelete(saved.id)}
            aria-label={`Remover filtro salvo "${saved.name}"`}
            className="rounded-full p-0.5 text-neutral-300 opacity-0 hover:text-red-500 group-hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {naming ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setNaming(false);
            }}
            autoFocus
            placeholder="Nome do filtro..."
            className="h-7 rounded-full border border-neutral-300 bg-white px-2.5 text-xs outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={handleSave}
            className="h-7 rounded-full bg-neutral-900 px-2.5 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => setNaming(false)}
            className="h-7 rounded-full px-2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNaming(true)}
          disabled={!hasActiveFilters(currentFilters)}
          title={
            hasActiveFilters(currentFilters)
              ? 'Salvar esta combinação de filtros'
              : 'Aplique ao menos um filtro para salvar'
          }
          className="flex h-7 items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2.5 text-xs text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Plus className="h-3 w-3" />
          Salvar filtro atual
        </button>
      )}
    </div>
  );
}
