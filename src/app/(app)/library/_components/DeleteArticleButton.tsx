'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteArticleAction } from '../actions';

export function DeleteArticleButton({ articleId, title }: { articleId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Excluir "${title}" da biblioteca? Essa ação não pode ser desfeita.`)) return;

    startTransition(async () => {
      try {
        await deleteArticleAction(articleId);
        toast.success('Artigo excluído');
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao excluir artigo');
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      aria-label="Excluir artigo"
      title="Excluir artigo"
      className="shrink-0 rounded-md p-1 text-neutral-300 transition-colors hover:text-red-500 disabled:opacity-50 dark:text-neutral-600"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
