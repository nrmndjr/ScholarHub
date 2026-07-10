import Link from 'next/link';
import { FavoriteButton } from './FavoriteButton';
import { StatusBadge } from './StatusBadge';
import type { LibraryArticleItem } from './types';

export function LibraryTableView({ items }: { items: LibraryArticleItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <tr>
            <th className="w-8 px-3 py-2"></th>
            <th className="px-3 py-2 font-medium">Título</th>
            <th className="px-3 py-2 font-medium">Autores</th>
            <th className="px-3 py-2 font-medium">Ano</th>
            <th className="px-3 py-2 font-medium">Periódico</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Destaques</th>
            <th className="px-3 py-2 font-medium">Comentários</th>
            <th className="px-3 py-2 font-medium">Última leitura</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <td className="px-3 py-2">
                <FavoriteButton articleId={item.id} favorite={item.favorite} />
              </td>
              <td className="max-w-xs px-3 py-2">
                <Link href={`/article/${item.id}`} className="line-clamp-1 font-medium hover:underline">
                  {item.title}
                </Link>
              </td>
              <td className="max-w-[12rem] px-3 py-2 text-neutral-500 dark:text-neutral-400">
                <span className="line-clamp-1">{item.authors.join(', ') || '—'}</span>
              </td>
              <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{item.year ?? '—'}</td>
              <td className="max-w-[10rem] px-3 py-2 text-neutral-500 dark:text-neutral-400">
                <span className="line-clamp-1">{item.journal ?? '—'}</span>
              </td>
              <td className="px-3 py-2">
                <StatusBadge articleId={item.id} status={item.status} />
              </td>
              <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{item.highlightsCount}</td>
              <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{item.commentsCount}</td>
              <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                {item.lastOpenedAt ? new Date(item.lastOpenedAt).toLocaleDateString('pt-BR') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
