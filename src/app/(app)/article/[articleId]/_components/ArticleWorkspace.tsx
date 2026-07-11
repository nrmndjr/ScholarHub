'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RightPanelTabs } from './RightPanel/RightPanelTabs';
import { CommentComposerDialog } from './CommentComposerDialog';
import { createHighlightAction, createCommentAction, updateProgressAction, closeSessionAction } from '../actions';
import { plainTextToTiptapDoc } from '@/modules/comments/domain/tiptap-plain-text';
import type { ArticleData, HighlightItem, CommentItem } from './types';
import type { HighlightColor, HighlightPositionData } from '@/modules/highlights/domain/entities';

const PdfViewer = dynamic(() => import('./PdfViewer').then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">Carregando leitor...</div>
  ),
});

export function ArticleWorkspace({
  article,
  highlights,
  comments,
  pageTexts,
}: {
  article: ArticleData;
  highlights: HighlightItem[];
  comments: CommentItem[];
  pageTexts: string[];
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(article.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number | null>(article.totalPages);
  const [pendingComment, setPendingComment] = useState<{
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
  } | null>(null);

  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPage = useRef(currentPage);

  useEffect(() => {
    latestPage.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (progressTimer.current) clearTimeout(progressTimer.current);
    progressTimer.current = setTimeout(() => {
      updateProgressAction(article.id, currentPage, totalPages ?? undefined);
    }, 800);
    return () => {
      if (progressTimer.current) clearTimeout(progressTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      closeSessionAction(article.id, latestPage.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectionColor(data: {
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
    color: HighlightColor;
  }) {
    try {
      await createHighlightAction({ articleId: article.id, ...data });
      router.refresh();
      toast.success('Destaque criado');
    } catch {
      toast.error('Erro ao criar destaque');
    }
  }

  function handleSelectionComment(data: { page: number; excerptText: string; positionData: HighlightPositionData }) {
    setPendingComment(data);
  }

  async function submitPendingComment(text: string) {
    if (!pendingComment) return;
    const highlight = await createHighlightAction({
      articleId: article.id,
      page: pendingComment.page,
      excerptText: pendingComment.excerptText,
      positionData: pendingComment.positionData,
      color: 'COMENTARIO',
    });
    await createCommentAction({ articleId: article.id, highlightId: highlight.id, body: plainTextToTiptapDoc(text) });
    router.refresh();
    toast.success('Comentário adicionado');
  }

  return (
    <div className="-m-6 grid h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[1fr_380px]">
      <div className="min-h-0">
        <PdfViewer
          fileUrl={article.fileUrl}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onDocumentLoad={(n) => setTotalPages(n)}
          totalPages={totalPages}
          highlights={highlights}
          pageTexts={pageTexts}
          onSelectionColor={handleSelectionColor}
          onSelectionComment={handleSelectionComment}
        />
      </div>

      <div className="min-h-0 border-t border-neutral-200 lg:border-l lg:border-t-0 dark:border-neutral-800">
        <RightPanelTabs article={article} highlights={highlights} comments={comments} onJumpToPage={setCurrentPage} />
      </div>

      {pendingComment && (
        <CommentComposerDialog
          open={!!pendingComment}
          onOpenChange={(open) => !open && setPendingComment(null)}
          excerptText={pendingComment.excerptText}
          onSubmit={submitPendingComment}
        />
      )}
    </div>
  );
}
