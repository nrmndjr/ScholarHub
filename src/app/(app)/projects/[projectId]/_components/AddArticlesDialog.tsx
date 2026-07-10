'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { addArticleToProjectAction, listAvailableArticlesAction } from '../actions';

export function AddArticlesDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ id: string; title: string; year: number | null }[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [syncedOpen, setSyncedOpen] = useState(open);

  if (syncedOpen !== open) {
    setSyncedOpen(open);
    if (open) setLoading(true);
  }

  useEffect(() => {
    if (!open) return;
    listAvailableArticlesAction(projectId)
      .then(setOptions)
      .finally(() => setLoading(false));
  }, [open, projectId]);

  async function handleAdd(articleId: string) {
    setAddingId(articleId);
    try {
      await addArticleToProjectAction(projectId, articleId);
      setOptions((prev) => prev.filter((o) => o.id !== articleId));
      toast.success('Artigo vinculado ao projeto');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao vincular artigo');
    } finally {
      setAddingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Vincular artigos da Biblioteca" className="max-w-md">
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {loading && <p className="text-sm text-neutral-400">Carregando...</p>}
        {!loading && options.length === 0 && (
          <p className="text-sm text-neutral-400">
            Todos os artigos da sua Biblioteca já estão vinculados, ou a Biblioteca está vazia.
          </p>
        )}
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={addingId === option.id}
            onClick={() => handleAdd(option.id)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800"
          >
            <span className="truncate">
              {option.title}
              {option.year ? ` (${option.year})` : ''}
            </span>
            <span className="shrink-0 text-xs text-accent">{addingId === option.id ? '...' : '+ Adicionar'}</span>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
