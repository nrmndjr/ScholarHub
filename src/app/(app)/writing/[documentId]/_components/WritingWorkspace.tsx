'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/Button';
import { getDocumentWordAndCharCount } from '@/modules/writing/domain/block-text';
import type { WritingBlockData } from '@/modules/writing/domain/entities';
import type { WritingDocumentDetail } from '@/modules/writing/use-cases/get-document';
import type { InsertableArticle } from '@/modules/writing/use-cases/list-insertable-content';
import { BlockCard } from './BlockCard';
import { ContentPicker } from './ContentPicker';
import { ExportMenu } from './ExportMenu';
import { renameDocumentAction, addTextBlockAction, addReferenceBlockAction, reorderBlocksAction } from '../actions';

function CanvasDropzone({ children }: { children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: 'canvas' });
  return (
    <div ref={setNodeRef} className="min-h-[200px] space-y-2">
      {children}
    </div>
  );
}

export function WritingWorkspace({
  document,
  initialInsertableContent,
}: {
  document: WritingDocumentDetail;
  initialInsertableContent: InsertableArticle[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(document.title);
  const [blocks, setBlocks] = useState<WritingBlockData[]>(document.blocks);
  const [syncedDocumentBlocks, setSyncedDocumentBlocks] = useState(document.blocks);

  if (syncedDocumentBlocks !== document.blocks) {
    setSyncedDocumentBlocks(document.blocks);
    setBlocks(document.blocks);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const { words, chars } = useMemo(() => getDocumentWordAndCharCount(blocks), [blocks]);

  function handleBlockTextChange(blockId: string, html: string) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, textContent: html } : b)));
  }

  async function handleTitleBlur() {
    if (title.trim() && title !== document.title) {
      await renameDocumentAction(document.id, title);
    }
  }

  async function handleAddText() {
    await addTextBlockAction(document.id, '');
    router.refresh();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);

    if (activeId.startsWith('picker|')) {
      const [, blockType, refId, articleId] = activeId.split('|');
      const action =
        blockType === 'HIGHLIGHT_REF'
          ? addReferenceBlockAction(document.id, { blockType: 'HIGHLIGHT_REF', highlightId: refId })
          : blockType === 'COMMENT_REF'
            ? addReferenceBlockAction(document.id, { blockType: 'COMMENT_REF', commentId: refId })
            : blockType === 'SUMMARY_REF'
              ? addReferenceBlockAction(document.id, { blockType: 'SUMMARY_REF', articleId })
              : addReferenceBlockAction(document.id, { blockType: 'CITATION_REF', articleId });

      action.then(() => router.refresh());
      return;
    }

    const oldIndex = blocks.findIndex((b) => b.id === activeId);
    const newIndex = blocks.findIndex((b) => b.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(reordered);
    reorderBlocksAction(
      document.id,
      reordered.map((b) => b.id)
    );
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
        <Link href="/writing" className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <span className="shrink-0 text-xs text-neutral-400">
          {words} palavra{words === 1 ? '' : 's'} · {chars} caractere{chars === 1 ? '' : 's'}
        </span>
        <ExportMenu title={title} blocks={blocks} />
        <Button size="sm" variant="secondary" onClick={handleAddText}>
          <Plus className="h-4 w-4" />
          Texto livre
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {blocks.length === 0 ? (
              <CanvasDropzone>
                <div className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-16 text-center dark:border-neutral-800">
                  <p className="text-sm text-neutral-400">
                    Arraste destaques, comentários, resumos ou citações da lista ao lado, ou adicione um texto livre.
                  </p>
                </div>
              </CanvasDropzone>
            ) : (
              <CanvasDropzone>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {blocks.map((block) => (
                    <BlockCard
                      key={block.id}
                      block={block}
                      documentId={document.id}
                      onTextChange={handleBlockTextChange}
                    />
                  ))}
                </SortableContext>
              </CanvasDropzone>
            )}
          </div>

          <div className="w-72 shrink-0 border-l border-neutral-200 dark:border-neutral-800">
            <ContentPicker initial={initialInsertableContent} />
          </div>
        </div>
      </DndContext>
    </div>
  );
}
