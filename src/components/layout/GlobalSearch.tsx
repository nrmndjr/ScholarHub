'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Quote, Tag as TagIcon, FolderKanban, Loader2 } from 'lucide-react';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { globalSearchAction } from '@/app/(app)/actions';
import type { GlobalSearchResults } from '@/modules/search/use-cases/global-search';

const EMPTY_RESULTS: GlobalSearchResults = { articles: [], highlights: [], tags: [], projects: [] };

interface FlatResult {
  key: string;
  icon: React.ReactNode;
  label: string;
  meta: string;
  href: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResults>(EMPTY_RESULTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function openPalette() {
    setQuery('');
    setResults(EMPTY_RESULTS);
    setActiveIndex(0);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => {
          if (v) return false;
          openPalette();
          return true;
        });
      }
    }
    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearchAction(query);
        setResults(data);
        setActiveIndex(0);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open]);

  const flatResults: FlatResult[] = useMemo(() => {
    const items: FlatResult[] = [];
    for (const a of results.articles) {
      items.push({
        key: `article-${a.id}`,
        icon: <FileText className="h-4 w-4 text-neutral-400" />,
        label: a.title,
        meta: [a.authors.join(', '), a.year ? String(a.year) : null].filter(Boolean).join(' · ') || 'Artigo',
        href: `/article/${a.id}`,
      });
    }
    for (const h of results.highlights) {
      const meta = HIGHLIGHT_COLOR_META[h.color as HighlightColor];
      items.push({
        key: `highlight-${h.id}`,
        icon: <Quote className="h-4 w-4 text-neutral-400" />,
        label: h.excerptText,
        meta: `${meta.emoji} ${h.articleTitle} · p. ${h.page}`,
        href: `/article/${h.articleId}?page=${h.page}`,
      });
    }
    for (const t of results.tags) {
      items.push({
        key: `tag-${t.id}`,
        icon: <TagIcon className="h-4 w-4 text-neutral-400" />,
        label: t.name,
        meta: `${t.highlightCount} destaque${t.highlightCount === 1 ? '' : 's'}`,
        href: `/knowledge-base/tags/${t.id}`,
      });
    }
    for (const p of results.projects) {
      items.push({
        key: `project-${p.id}`,
        icon: <FolderKanban className="h-4 w-4 text-neutral-400" />,
        label: p.name,
        meta: 'Projeto',
        href: `/projects/${p.id}`,
      });
    }
    return items;
  }, [results]);

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatResults[activeIndex];
      if (item) navigateTo(item.href);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="flex h-8 w-56 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-2.5 text-xs text-neutral-400 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Buscar em tudo...</span>
        <kbd className="rounded border border-neutral-300 bg-neutral-50 px-1 font-sans text-[10px] dark:border-neutral-700 dark:bg-neutral-800">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2.5 dark:border-neutral-800">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar artigos, destaques, tags, projetos..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              {isPending && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-neutral-400" />}
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-1.5">
              {!query.trim() ? (
                <p className="px-3 py-6 text-center text-xs text-neutral-400">
                  Digite para buscar em artigos, destaques, tags e projetos.
                </p>
              ) : flatResults.length === 0 && !isPending ? (
                <p className="px-3 py-6 text-center text-xs text-neutral-400">Nenhum resultado encontrado.</p>
              ) : (
                flatResults.map((item, index) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTo(item.href)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left ${
                      index === activeIndex
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">{item.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-neutral-800 dark:text-neutral-200">{item.label}</span>
                      <span className="block truncate text-xs text-neutral-400">{item.meta}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
