'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FileText, FileType } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun as DocxTextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import { buildExportSections, type ExportSection } from '@/modules/writing/domain/export-sections';
import type { TextRun } from '@/modules/writing/domain/rich-text-parser';
import type { WritingBlockData } from '@/modules/writing/domain/entities';

function sanitizeFilename(title: string): string {
  return (title.trim() || 'documento').replace(/[^a-zA-Z0-9À-ÿ -]/g, '').replace(/\s+/g, '-');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function exportToDocx(title: string, sections: ExportSection[]) {
  const children: Paragraph[] = [
    new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
  ];

  for (const section of sections) {
    for (const runs of section.paragraphs) {
      children.push(
        new Paragraph({
          children: runs.map(
            (run) => new DocxTextRun({ text: run.text, bold: run.bold, italics: run.italic })
          ),
          spacing: { after: 120 },
        })
      );
    }
    if (section.sourceMeta) {
      children.push(
        new Paragraph({
          children: [new DocxTextRun({ text: section.sourceMeta, italics: true, size: 18, color: '888888' })],
          spacing: { after: 240 },
        })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${sanitizeFilename(title)}.docx`);
}

function addWrappedParagraph(
  doc: jsPDF,
  runs: TextRun[],
  startX: number,
  startY: number,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  pageHeight: number,
  marginBottom: number,
  topMargin: number
): number {
  let cursorX = startX;
  let cursorY = startY;
  doc.setFontSize(fontSize);

  function ensureSpace() {
    if (cursorY > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = topMargin;
      cursorX = startX;
    }
  }

  for (const run of runs) {
    const style = run.bold && run.italic ? 'bolditalic' : run.bold ? 'bold' : run.italic ? 'italic' : 'normal';
    doc.setFont('helvetica', style);
    const tokens = run.text.split(/(\s+)/).filter((t) => t !== '');
    for (const token of tokens) {
      const isSpace = /^\s+$/.test(token);
      const width = doc.getTextWidth(token);
      if (!isSpace && cursorX + width > startX + maxWidth) {
        cursorY += lineHeight;
        cursorX = startX;
        ensureSpace();
      }
      if (isSpace) {
        if (cursorX > startX) {
          cursorX += width;
        }
      } else {
        ensureSpace();
        doc.text(token, cursorX, cursorY);
        cursorX += width;
      }
    }
  }
  return cursorY + lineHeight;
}

function exportToPdf(title: string, sections: ExportSection[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  const bodyFontSize = 11;
  const bodyLineHeight = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, margin, margin);
  let y = margin + 30;

  for (const section of sections) {
    for (const runs of section.paragraphs) {
      y = addWrappedParagraph(doc, runs, margin, y, maxWidth, bodyFontSize, bodyLineHeight, pageHeight, margin, margin);
    }
    if (section.sourceMeta) {
      doc.setTextColor(140, 140, 140);
      y = addWrappedParagraph(
        doc,
        [{ text: section.sourceMeta, bold: false, italic: true }],
        margin,
        y,
        maxWidth,
        9,
        13,
        pageHeight,
        margin,
        margin
      );
      doc.setTextColor(0, 0, 0);
      y += 6;
    }
  }

  doc.save(`${sanitizeFilename(title)}.pdf`);
}

export function ExportMenu({ title, blocks }: { title: string; blocks: WritingBlockData[] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleExportDocx() {
    setOpen(false);
    exportToDocx(title, buildExportSections(blocks));
  }

  function handleExportPdf() {
    setOpen(false);
    exportToPdf(title, buildExportSections(blocks));
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={blocks.length === 0}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-300 px-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Download className="h-3.5 w-3.5" />
        Exportar
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <button
            type="button"
            onClick={handleExportDocx}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FileType className="h-3.5 w-3.5 text-neutral-400" />
            Word (.docx)
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FileText className="h-3.5 w-3.5 text-neutral-400" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
