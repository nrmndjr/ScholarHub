import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { listLibraryArticles, listLibraryFilterOptions, type LibrarySort } from '@/modules/articles/use-cases/list-library-articles';
import Link from 'next/link';
import { LibraryToolbar } from './_components/LibraryToolbar';
import { LibraryCardView } from './_components/LibraryCardView';
import { LibraryListView } from './_components/LibraryListView';
import { LibraryTableView } from './_components/LibraryTableView';
import type { LibraryArticleItem } from './_components/types';
import { Library } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function formatReadingTime(totalSeconds: number) {
  if (totalSeconds <= 0) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const user = await getCurrentUserOrThrow();

  const view = (typeof params.view === 'string' ? params.view : 'cards') as 'cards' | 'list' | 'table';
  const sort = (typeof params.sort === 'string' ? params.sort : 'lastRead') as LibrarySort;

  const filters = {
    projectId: typeof params.project === 'string' ? params.project : undefined,
    folderId: typeof params.folder === 'string' ? params.folder : undefined,
    authorId: typeof params.author === 'string' ? params.author : undefined,
    journalId: typeof params.journal === 'string' ? params.journal : undefined,
    status: typeof params.status === 'string' ? params.status : undefined,
    tagId: typeof params.tag === 'string' ? params.tag : undefined,
    year: typeof params.year === 'string' && params.year ? Number(params.year) : undefined,
    favoritesOnly: params.favorites === '1',
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== false);

  const [articles, filterOptions] = await Promise.all([
    listLibraryArticles({ userId: user.id, filters, sort }, { prisma }),
    listLibraryFilterOptions(user.id, { prisma }),
  ]);

  const items: LibraryArticleItem[] = articles.map((article) => {
    const totalSeconds = article.readingSessions.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
    return {
      id: article.id,
      title: article.title,
      authors: article.authors.map((a) => a.author.name),
      year: article.year,
      journal: article.journal?.name ?? null,
      projects: article.projects.map((p) => p.project.name),
      folder: article.folder?.name ?? null,
      tags: article.tags.map((t) => t.tag.name),
      favorite: article.favorite,
      status: article.status,
      progress: article.totalPages ? Math.min(1, article.currentPage / article.totalPages) : null,
      lastOpenedAt: article.lastOpenedAt ? article.lastOpenedAt.toISOString() : null,
      highlightsCount: article._count.highlights,
      commentsCount: article._count.comments,
      readingTimeLabel: formatReadingTime(totalSeconds),
      createdAt: article.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Biblioteca</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {items.length} artigo{items.length === 1 ? '' : 's'} na sua biblioteca.
        </p>
      </div>

      <LibraryToolbar options={filterOptions} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Library className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {hasActiveFilters
              ? 'Nenhum artigo encontrado com esses filtros.'
              : 'Sua biblioteca está vazia. Envie PDFs na Inbox e arquive-os aqui.'}
          </p>
          {hasActiveFilters ? (
            <Link href="/library">
              <Button size="sm" variant="secondary">
                Limpar filtros
              </Button>
            </Link>
          ) : (
            <Link href="/inbox">
              <Button size="sm">Ir para Inbox</Button>
            </Link>
          )}
        </div>
      ) : view === 'list' ? (
        <LibraryListView items={items} />
      ) : view === 'table' ? (
        <LibraryTableView items={items} />
      ) : (
        <LibraryCardView items={items} />
      )}
    </div>
  );
}
