'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  MANUAL_CONNECTION_TYPES,
  MANUAL_CONNECTION_LABELS,
  type ManualConnectionType,
} from '@/modules/knowledge-map/domain/entities';
import {
  createManualConnectionAction,
  deleteManualConnectionAction,
  listArticlesForPickerAction,
} from '../actions';

export interface ManualConnectionItem {
  edgeId: string;
  otherArticleRefId: string;
  otherLabel: string;
  connectionType: ManualConnectionType;
  note?: string | null;
}

export function ManualConnectionsSection({
  articleId,
  articleLabel,
  connections,
}: {
  articleId: string;
  articleLabel: string;
  connections: ManualConnectionItem[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [options, setOptions] = useState<{ id: string; title: string; year: number | null }[]>([]);
  const [targetId, setTargetId] = useState('');
  const [connectionType, setConnectionType] = useState<ManualConnectionType>('COMPLEMENTA');

  useEffect(() => {
    if (!adding) return;
    listArticlesForPickerAction().then((all) => setOptions(all.filter((a) => a.id !== articleId)));
  }, [adding, articleId]);

  async function handleAdd() {
    if (!targetId) {
      toast.error('Escolha um artigo');
      return;
    }
    setSaving(true);
    try {
      await createManualConnectionAction({
        sourceArticleId: articleId,
        targetArticleId: targetId,
        connectionType,
      });
      toast.success('Conexão criada');
      setAdding(false);
      setTargetId('');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conexão');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(edgeId: string) {
    try {
      await deleteManualConnectionAction(edgeId);
      toast.success('Conexão removida');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover conexão');
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Conexões manuais</h4>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <Plus className="h-3 w-3" />
            Adicionar
          </button>
        )}
      </div>

      {connections.length === 0 && !adding && (
        <p className="text-xs text-neutral-400">Nenhuma conexão manual para &quot;{articleLabel}&quot; ainda.</p>
      )}

      <div className="space-y-1.5">
        {connections.map((c) => (
          <div
            key={c.edgeId}
            className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs dark:border-neutral-800"
          >
            <div className="min-w-0">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {MANUAL_CONNECTION_LABELS[c.connectionType]}
              </span>
              <span className="text-neutral-400"> · </span>
              <span className="truncate text-neutral-600 dark:text-neutral-300">{c.otherLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(c.edgeId)}
              className="shrink-0 text-neutral-400 hover:text-red-500"
              aria-label="Remover conexão"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="space-y-2 rounded-lg border border-neutral-200 p-2.5 dark:border-neutral-800">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">Escolher artigo...</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
                {o.year ? ` (${o.year})` : ''}
              </option>
            ))}
          </select>
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value as ManualConnectionType)}
            className="h-8 w-full rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          >
            {MANUAL_CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {MANUAL_CONNECTION_LABELS[t]}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving}>
              <Link2 className="h-3.5 w-3.5" />
              {saving ? 'Salvando...' : 'Conectar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
