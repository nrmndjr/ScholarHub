'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  PanelLeft,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HIGHLIGHT_COLOR_META, type HighlightColor, type HighlightPositionData } from '@/modules/highlights/domain/entities';
import { SelectionMenu } from './SelectionMenu';
import type { HighlightItem } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
};

const BASE_WIDTH = 720;
const MIN_SCALE = 0.6;
const MAX_SCALE = 2.2;

interface PendingSelection {
  page: number;
  excerptText: string;
  positionData: HighlightPositionData;
  menuX: number;
  menuY: number;
}

export function PdfViewer({
  fileUrl,
  currentPage,
  onPageChange,
  onDocumentLoad,
  totalPages,
  highlights,
  pageTexts,
  onSelectionColor,
  onSelectionComment,
}: {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onDocumentLoad: (numPages: number) => void;
  totalPages: number | null;
  highlights: HighlightItem[];
  pageTexts: string[];
  onSelectionColor: (data: {
    page: number;
    excerptText: string;
    positionData: HighlightPositionData;
    color: HighlightColor;
  }) => void;
  onSelectionComment: (data: { page: number; excerptText: string; positionData: HighlightPositionData }) => void;
}) {
  const [numPages, setNumPages] = useState<number | null>(totalPages);
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageBox, setPageBox] = useState({ width: BASE_WIDTH, height: BASE_WIDTH * 1.414 });
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [syncedPage, setSyncedPage] = useState(currentPage);

  const pageContainerRef = useRef<HTMLDivElement>(null);

  if (syncedPage !== currentPage) {
    setSyncedPage(currentPage);
    setPageInput(String(currentPage));
  }

  function handleLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    onDocumentLoad(n);
  }

  function updatePageBox() {
    const el = pageContainerRef.current?.querySelector('.react-pdf__Page__canvas') as HTMLElement | null;
    if (el) setPageBox({ width: el.clientWidth, height: el.clientHeight });
  }

  function goToPage(page: number) {
    if (!numPages) return;
    const clamped = Math.min(Math.max(1, page), numPages);
    onPageChange(clamped);
    setPending(null);
  }

  function handleMouseUp() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    const text = selection.toString().trim();
    if (!text) return;

    const container = pageContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects());
    if (clientRects.length === 0) return;

    const rects = clientRects.map((r) => ({
      x: (r.left - containerRect.left) / containerRect.width,
      y: (r.top - containerRect.top) / containerRect.height,
      width: r.width / containerRect.width,
      height: r.height / containerRect.height,
    }));

    const lastRect = clientRects[clientRects.length - 1];

    setPending({
      page: currentPage,
      excerptText: text,
      positionData: { rects },
      menuX: lastRect.left + lastRect.width / 2,
      menuY: lastRect.top - 8,
    });
  }

  function clearSelection() {
    window.getSelection()?.removeAllRanges();
    setPending(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;
    const total = pageTexts.length;
    for (let offset = 1; offset <= total; offset++) {
      const candidate = ((currentPage - 1 + offset) % total) + 1;
      if (pageTexts[candidate - 1]?.toLowerCase().includes(query)) {
        goToPage(candidate);
        return;
      }
    }
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, numPages]);

  const pageHighlights = useMemo(() => highlights.filter((h) => h.page === currentPage), [highlights, currentPage]);

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-neutral-100 dark:bg-neutral-950',
        fullscreen && 'fixed inset-0 z-40'
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => setShowThumbnails((v) => !v)}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Miniaturas"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToPage(Number(pageInput) || 1);
            }}
          >
            <input
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="h-7 w-10 rounded-md border border-neutral-200 bg-white text-center text-xs dark:border-neutral-700 dark:bg-neutral-900"
            />
          </form>
          <span className="text-xs text-neutral-400">/ {numPages ?? '—'}</span>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
            disabled={!numPages || currentPage >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

        <button
          type="button"
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.1))}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-xs text-neutral-400">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.1))}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-800" />

        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Modo escuro do leitor"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Tela cheia"
        >
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        <form onSubmit={handleSearch} className="ml-auto flex items-center gap-1">
          <Search className="h-3.5 w-3.5 text-neutral-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no artigo"
            className="h-7 w-36 rounded-md border border-neutral-200 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-900"
          />
        </form>
      </div>

      {numPages && (
        <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${(currentPage / numPages) * 100}%` }}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {showThumbnails && (
          <div className="w-28 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-900">
            <Document file={fileUrl} options={PDF_OPTIONS}>
              {Array.from({ length: numPages ?? 0 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={cn(
                    'mb-2 block w-full overflow-hidden rounded-md border-2',
                    p === currentPage ? 'border-accent' : 'border-transparent'
                  )}
                >
                  <Page pageNumber={p} width={96} renderTextLayer={false} renderAnnotationLayer={false} />
                  <span className="block text-center text-[10px] text-neutral-400">{p}</span>
                </button>
              ))}
            </Document>
          </div>
        )}

        <div className="relative flex-1 overflow-auto p-6" onScroll={clearSelection}>
          <div
            className={cn('mx-auto w-fit', darkMode && 'invert-[0.92] hue-rotate-180')}
            ref={pageContainerRef}
            onMouseUp={handleMouseUp}
          >
            <div className="relative">
              <Document file={fileUrl} options={PDF_OPTIONS} onLoadSuccess={handleLoadSuccess} loading={<PdfSkeleton />}>
                <Page
                  pageNumber={currentPage}
                  width={BASE_WIDTH * scale}
                  onRenderSuccess={updatePageBox}
                  renderAnnotationLayer={false}
                />
              </Document>

              {pageHighlights.map((highlight) =>
                highlight.positionData.rects.map((rect, idx) => (
                  <div
                    key={`${highlight.id}-${idx}`}
                    title={highlight.excerptText}
                    className="pointer-events-none absolute rounded-[2px] mix-blend-multiply"
                    style={{
                      left: rect.x * pageBox.width,
                      top: rect.y * pageBox.height,
                      width: rect.width * pageBox.width,
                      height: rect.height * pageBox.height,
                      backgroundColor: HIGHLIGHT_COLOR_META[highlight.color].cssVar,
                      opacity: 0.4,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {pending && (
            <SelectionMenu
              x={pending.menuX}
              y={pending.menuY}
              onPickColor={(color) => {
                onSelectionColor({
                  page: pending.page,
                  excerptText: pending.excerptText,
                  positionData: pending.positionData,
                  color,
                });
                clearSelection();
              }}
              onComment={() => {
                onSelectionComment({
                  page: pending.page,
                  excerptText: pending.excerptText,
                  positionData: pending.positionData,
                });
                clearSelection();
              }}
              onCopy={() => {
                navigator.clipboard.writeText(pending.excerptText);
                clearSelection();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function PdfSkeleton() {
  return (
    <div
      className="animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
      style={{ width: BASE_WIDTH, height: BASE_WIDTH * 1.414 }}
    />
  );
}
