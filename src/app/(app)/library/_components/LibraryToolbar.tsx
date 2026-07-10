'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Table2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ARTICLE_STATUSES, ARTICLE_STATUS_LABELS } from '@/modules/articles/domain/entities';

export interface LibraryFilterOptions {
  folders: { id: string; name: string }[];
  journals: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  projects: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  years: number[];
}

const VIEW_OPTIONS = [
  { value: 'cards', icon: LayoutGrid, label: 'Cards' },
  { value: 'list', icon: List, label: 'Lista' },
  { value: 'table', icon: Table2, label: 'Tabela' },
] as const;

const SORT_OPTIONS = [
  { value: 'lastRead', label: 'Última leitura' },
  { value: 'createdAt', label: 'Data de inclusão' },
  { value: 'year', label: 'Ano' },
  { value: 'author', label: 'Autor' },
  { value: 'highlights', label: 'Quantidade de destaques' },
  { value: 'title', label: 'Título' },
] as const;

export function LibraryToolbar({ options }: { options: LibraryFilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = searchParams.get('view') ?? 'cards';
  const favoritesOnly = searchParams.get('favorites') === '1';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleFavorites() {
    updateParam('favorites', favoritesOnly ? '' : '1');
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={searchParams.get('project') ?? ''}
        onChange={(e) => updateParam('project', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Projeto</option>
        {options.projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('folder') ?? ''}
        onChange={(e) => updateParam('folder', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Pasta</option>
        {options.folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('author') ?? ''}
        onChange={(e) => updateParam('author', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Autor</option>
        {options.authors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('year') ?? ''}
        onChange={(e) => updateParam('year', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Ano</option>
        {options.years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('journal') ?? ''}
        onChange={(e) => updateParam('journal', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Periódico</option>
        {options.journals.map((j) => (
          <option key={j.id} value={j.id}>
            {j.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('status') ?? ''}
        onChange={(e) => updateParam('status', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Status</option>
        {ARTICLE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ARTICLE_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('tag') ?? ''}
        onChange={(e) => updateParam('tag', e.target.value)}
        className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
      >
        <option value="">Tag</option>
        {options.tags.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={toggleFavorites}
        className={cn(
          'inline-flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-medium',
          favoritesOnly
            ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
            : 'border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400'
        )}
      >
        <Star className={cn('h-3.5 w-3.5', favoritesOnly && 'fill-amber-500 text-amber-500')} />
        Favoritos
      </button>

      <div className="ml-auto flex items-center gap-2">
        <select
          value={searchParams.get('sort') ?? 'lastRead'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700">
          {VIEW_OPTIONS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.value}
                type="button"
                onClick={() => updateParam('view', v.value)}
                aria-label={v.label}
                className={cn(
                  'rounded-md p-1.5',
                  view === v.value
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
