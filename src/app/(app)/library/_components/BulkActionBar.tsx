'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ARTICLE_STATUSES, ARTICLE_STATUS_LABELS } from '@/modules/articles/domain/entities';
import { bulkSetFolderAction, bulkAddTagAction, bulkAddToProjectAction, bulkChangeStatusAction } from '../actions';

export interface OrganizeOptions {
  folders: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}

const selectClass =
  'h-8 rounded-lg border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900 disabled:opacity-50';

export function BulkActionBar({
  selectedIds,
  totalCount,
  allSelected,
  onToggleSelectAll,
  onClearSelection,
  organizeOptions,
}: {
  selectedIds: string[];
  totalCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  organizeOptions: OrganizeOptions;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, successMessage: string) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(successMessage);
        onClearSelection();
      } catch {
        toast.error('Erro ao aplicar ação em massa');
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 dark:border-neutral-800">
      <label className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
        <input type="checkbox" checked={allSelected} onChange={onToggleSelectAll} className="h-3.5 w-3.5" />
        {selectedIds.length > 0
          ? `${selectedIds.length} de ${totalCount} selecionado${selectedIds.length === 1 ? '' : 's'}`
          : 'Selecionar todos'}
      </label>

      {selectedIds.length > 0 && (
        <>
          <select
            disabled={isPending}
            defaultValue=""
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) return;
              const folderId = raw === '__none__' ? null : raw;
              run(() => bulkSetFolderAction(selectedIds, folderId), 'Pasta atualizada');
              e.target.value = '';
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Mover para pasta...
            </option>
            <option value="__none__">Sem pasta</option>
            {organizeOptions.folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <select
            disabled={isPending}
            defaultValue=""
            onChange={(e) => {
              const tagId = e.target.value;
              if (!tagId) return;
              run(() => bulkAddTagAction(selectedIds, tagId), 'Tag adicionada');
              e.target.value = '';
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Adicionar tag...
            </option>
            {organizeOptions.tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            disabled={isPending}
            defaultValue=""
            onChange={(e) => {
              const projectId = e.target.value;
              if (!projectId) return;
              run(() => bulkAddToProjectAction(selectedIds, projectId), 'Adicionado ao projeto');
              e.target.value = '';
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Adicionar a projeto...
            </option>
            {organizeOptions.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            disabled={isPending}
            defaultValue=""
            onChange={(e) => {
              const status = e.target.value;
              if (!status) return;
              run(() => bulkChangeStatusAction(selectedIds, status), 'Status atualizado');
              e.target.value = '';
            }}
            className={selectClass}
          >
            <option value="" disabled>
              Alterar status...
            </option>
            {ARTICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ARTICLE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onClearSelection}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="h-3.5 w-3.5" />
            Limpar seleção
          </button>
        </>
      )}
    </div>
  );
}
