'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RightPanelTabs } from './RightPanel/RightPanelTabs';
import { HighlightAnnotationDialog } from './HighlightAnnotationDialog';
import { createHighlightAction, createCommentAction, updateProgressAction, closeSessionAction } from '../actions';
import { plainTextToTiptapDoc } from '@/modules/comments/domain/tiptap-plain-text';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { TagOption } from '@/components/ui/TagMultiSelect';
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
  availableTags,
  project,
}: {
  article: ArticleData;
  highlights: HighlightItem[];
  comments: CommentItem[];
  pageTexts: string[];
  availableTags: TagOption[];
  project?: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(article.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number | null>(article.totalPages);
  const [pendingHighlight, setPendingHighlight] = useState<{
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
    color: HighlightColor;
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

  function handleSelectionColor(data: {
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
    color: HighlightColor;
  }) {
    setPendingHighlight(data);
  }

  function handleSelectionComment(data: { page: number; excerptText: string; positionData: HighlightPositionData }) {
    setPendingHighlight({ ...data, color: 'COMENTARIO' });
  }

  async function submitPendingHighlight({ tagIds, commentText }: { tagIds: string[]; commentText: string }) {
    if (!pendingHighlight) return;
    try {
      const highlight = await createHighlightAction({
        articleId: article.id,
        page: pendingHighlight.page,
        excerptText: pendingHighlight.excerptText,
        positionData: pendingHighlight.positionData,
        color: pendingHighlight.color,
        tagIds,
      });
      if (commentText) {
        await createCommentAction({ articleId: article.id, highlightId: highlight.id, body: plainTextToTiptapDoc(commentText) });
      }
      router.refresh();
      toast.success('Destaque criado');
    } catch {
      toast.error('Erro ao criar destaque');
    }
  }

  const breadcrumbItems = project
    ? [
        { label: 'Projetos', href: '/projects' },
        { label: project.name, href: `/projects/${project.id}` },
        { label: article.title },
      ]
    : [{ label: 'Biblioteca', href: '/library' }, { label: article.title }];

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="shrink-0 border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
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
          <RightPanelTabs
            article={article}
            highlights={highlights}
            comments={comments}
            availableTags={availableTags}
            onJumpToPage={setCurrentPage}
          />
        </div>
      </div>

      {pendingHighlight && (
        <HighlightAnnotationDialog
          open={!!pendingHighlight}
          onOpenChange={(open) => !open && setPendingHighlight(null)}
          color={pendingHighlight.color}
          excerptText={pendingHighlight.excerptText}
          availableTags={availableTags}
          onSubmit={submitPendingHighlight}
        />
      )}
    </div>
  );
}
