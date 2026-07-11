'use client';

import { Search } from 'lucide-react';
import { ARTICLE_STATUSES, ARTICLE_STATUS_LABELS } from '@/modules/articles/domain/entities';
import { HIGHLIGHT_COLORS, HIGHLIGHT_COLOR_META } from '@/modules/highlights/domain/entities';
import type { HighlightSearchFilters } from '@/modules/knowledge-base/domain/entities';

export interface KnowledgeBaseFilterOptions {
  folders: { id: string; name: string }[];
  journals: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  years: number[];
}

const selectClass =
  'h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900';

export function FilterBar({
  filters,
  onChange,
  options,
}: {
  filters: HighlightSearchFilters;
  onChange: (filters: HighlightSearchFilters) => void;
  options: KnowledgeBaseFilterOptions;
}) {
  function set<K extends keyof HighlightSearchFilters>(key: K, value: HighlightSearchFilters[K]) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={filters.query ?? ''}
          onChange={(e) => set('query', e.target.value)}
          placeholder="Pesquisar por trecho, autor, comentário, tag..."
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={filters.projectId ?? ''} onChange={(e) => set('projectId', e.target.value)} className={selectClass}>
          <option value="">Projeto</option>
          {options.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select value={filters.folderId ?? ''} onChange={(e) => set('folderId', e.target.value)} className={selectClass}>
          <option value="">Pasta</option>
          {options.folders.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <select value={filters.authorId ?? ''} onChange={(e) => set('authorId', e.target.value)} className={selectClass}>
          <option value="">Autor</option>
          {options.authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select value={filters.journalId ?? ''} onChange={(e) => set('journalId', e.target.value)} className={selectClass}>
          <option value="">Periódico</option>
          {options.journals.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>

        <select
          value={filters.articleStatus ?? ''}
          onChange={(e) => set('articleStatus', e.target.value as HighlightSearchFilters['articleStatus'])}
          className={selectClass}
        >
          <option value="">Status do artigo</option>
          {ARTICLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ARTICLE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={filters.color ?? ''}
          onChange={(e) => set('color', e.target.value as HighlightSearchFilters['color'])}
          className={selectClass}
        >
          <option value="">Cor do destaque</option>
          {HIGHLIGHT_COLORS.map((c) => (
            <option key={c} value={c}>
              {HIGHLIGHT_COLOR_META[c].emoji} {HIGHLIGHT_COLOR_META[c].label}
            </option>
          ))}
        </select>

        <select
          value={filters.yearFrom ?? ''}
          onChange={(e) => set('yearFrom', e.target.value ? Number(e.target.value) : undefined)}
          className={selectClass}
        >
          <option value="">Ano de (≥)</option>
          {options.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filters.yearTo ?? ''}
          onChange={(e) => set('yearTo', e.target.value ? Number(e.target.value) : undefined)}
          className={selectClass}
        >
          <option value="">Ano até (≤)</option>
          {options.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => set('dateFrom', e.target.value)}
          title="Destacado a partir de"
          className={selectClass}
        />
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => set('dateTo', e.target.value)}
          title="Destacado até"
          className={selectClass}
        />

        {Object.values(filters).some((v) => v !== undefined && v !== '') && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="h-8 rounded-lg px-2 text-xs font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
