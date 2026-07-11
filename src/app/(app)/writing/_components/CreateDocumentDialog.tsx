'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { WRITING_DOCUMENT_TITLE_SUGGESTIONS } from '@/modules/writing/domain/entities';
import { createWritingDocumentAction } from '../actions';

export function CreateDocumentDialog({
  open,
  onOpenChange,
  projects,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Escolha um título para o documento');
      return;
    }
    setSaving(true);
    try {
      const document = await createWritingDocumentAction({ title, projectId: projectId || null });
      onOpenChange(false);
      setTitle('');
      setProjectId('');
      router.push(`/writing/${document.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar documento');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Novo documento" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Título</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Fundamentação Teórica" autoFocus />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {WRITING_DOCUMENT_TITLE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setTitle(suggestion)}
              className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 hover:border-accent hover:text-accent dark:border-neutral-700 dark:text-neutral-300"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {projects.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Projeto (opcional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Nenhum</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Criando...' : 'Criar documento'}
        </Button>
      </form>
    </Dialog>
  );
}
