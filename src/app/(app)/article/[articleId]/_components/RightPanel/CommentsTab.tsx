'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { HIGHLIGHT_COLOR_META, type HighlightColor } from '@/modules/highlights/domain/entities';
import { createCommentAction, deleteCommentAction } from '../../actions';
import { plainTextToTiptapDoc, tiptapToPlainText } from '@/modules/comments/domain/tiptap-plain-text';
import type { CommentItem } from '../types';

type FilterValue = 'ALL' | 'GERAL' | HighlightColor;

export function CommentsTab({
  articleId,
  comments,
  onJumpToPage,
}: {
  articleId: string;
  comments: CommentItem[];
  onJumpToPage: (page: number) => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterValue>('ALL');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return comments;
    if (filter === 'GERAL') return comments.filter((c) => !c.highlightColor);
    return comments.filter((c) => c.highlightColor === filter);
  }, [comments, filter]);

  async function handlePost() {
    if (!draft.trim()) return;
    setPosting(true);
    try {
      await createCommentAction({ articleId, highlightId: null, body: plainTextToTiptapDoc(draft.trim()) });
      setDraft('');
      router.refresh();
    } catch {
      toast.error('Erro ao adicionar comentário');
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCommentAction(articleId, id);
      router.refresh();
    } catch {
      toast.error('Erro ao excluir comentário');
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Comentário geral sobre o artigo..." />
        <Button size="sm" onClick={handlePost} disabled={posting || !draft.trim()}>
          {posting ? 'Enviando...' : 'Comentar'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['ALL', 'GERAL', 'CONCEITO_IMPORTANTE', 'METODOLOGIA', 'CITACAO', 'RESULTADO', 'CRITICA'] as FilterValue[]).map(
          (f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                filter === f
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-neutral-200 text-neutral-500 dark:border-neutral-700'
              }`}
            >
              {f === 'ALL' ? 'Todos' : f === 'GERAL' ? 'Geral' : HIGHLIGHT_COLOR_META[f].emoji}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-400">Nenhum comentário aqui ainda.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-neutral-200 p-2.5 text-sm dark:border-neutral-800">
              <div className="mb-1 flex items-center justify-between">
                {comment.highlightPage ? (
                  <button
                    type="button"
                    onClick={() => onJumpToPage(comment.highlightPage!)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    {comment.highlightColor && HIGHLIGHT_COLOR_META[comment.highlightColor].emoji} Página{' '}
                    {comment.highlightPage}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="text-xs font-medium text-neutral-400">Comentário geral</span>
                )}
                <span className="text-[11px] text-neutral-400">
                  {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {comment.highlightExcerpt && (
                <p className="mb-1 line-clamp-2 border-l-2 border-neutral-200 pl-2 text-xs italic text-neutral-500 dark:border-neutral-700">
                  {comment.highlightExcerpt}
                </p>
              )}
              <p className="text-neutral-700 dark:text-neutral-300">{tiptapToPlainText(comment.body)}</p>
              <button
                type="button"
                onClick={() => handleDelete(comment.id)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
