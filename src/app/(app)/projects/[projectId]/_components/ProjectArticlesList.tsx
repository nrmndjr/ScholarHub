'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { FileText, Highlighter, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { ARTICLE_STATUS_LABELS, type ArticleStatus } from '@/modules/articles/domain/entities';
import { removeArticleFromProjectAction } from '../actions';

export interface ProjectArticleItem {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  status: string;
  highlightsCount: number;
  commentsCount: number;
}

export function ProjectArticlesList({ articles, projectId }: { articles: ProjectArticleItem[]; projectId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <FileText className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Nenhum artigo vinculado ainda. Use &quot;Vincular artigos&quot; para adicionar itens da sua Biblioteca.
        </p>
      </div>
    );
  }

  function handleRemove(articleId: string) {
    startTransition(async () => {
      await removeArticleFromProjectAction(projectId, articleId);
      toast.success('Artigo desvinculado do projeto');
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="flex items-center gap-4 p-3 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
        >
          <Link href={`/article/${article.id}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{article.title}</p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {article.authors.join(', ') || 'Sem autores'}
              {article.year ? ` · ${article.year}` : ''}
            </p>
          </Link>
          <div className="hidden shrink-0 items-center gap-3 text-xs text-neutral-400 sm:flex">
            <span className="inline-flex items-center gap-1">
              <Highlighter className="h-3.5 w-3.5" />
              {article.highlightsCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {article.commentsCount}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {ARTICLE_STATUS_LABELS[article.status as ArticleStatus] ?? article.status}
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleRemove(article.id)}
            aria-label="Desvincular do projeto"
            className="shrink-0 rounded-md p-1 text-neutral-300 hover:text-red-500 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}
