'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, PenLine, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { WritingDocumentSummary } from '@/modules/writing/domain/entities';
import { CreateDocumentDialog } from './CreateDocumentDialog';
import { deleteWritingDocumentAction } from '../actions';

function formatUpdatedAt(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function WritingDocumentsGrid({
  documents,
  projects,
}: {
  documents: WritingDocumentSummary[];
  projects: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Excluir este documento e todos os seus blocos?')) return;
    try {
      await deleteWritingDocumentAction(id);
      toast.success('Documento excluído');
      router.refresh();
    } catch {
      toast.error('Erro ao excluir documento');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {documents.length} documento{documents.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <PenLine className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum documento ainda. Crie um workspace para começar a organizar sua escrita.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/writing/${doc.id}`}>
              <Card className="group flex h-full flex-col gap-2 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-semibold">{doc.title}</h3>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="shrink-0 rounded-md p-1 text-neutral-300 opacity-0 hover:bg-neutral-100 hover:text-red-500 group-hover:opacity-100 dark:text-neutral-700 dark:hover:bg-neutral-800"
                    aria-label="Excluir documento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {doc.projectName && (
                  <span className="w-fit rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                    {doc.projectName}
                  </span>
                )}
                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-neutral-400">
                  <span>
                    {doc.blockCount} bloco{doc.blockCount === 1 ? '' : 's'}
                  </span>
                  <span>{formatUpdatedAt(doc.updatedAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateDocumentDialog open={createOpen} onOpenChange={setCreateOpen} projects={projects} />
    </div>
  );
}
