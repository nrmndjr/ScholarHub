'use client';

import { useState } from 'react';
import { FileText, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CompletenessBadge } from '@/components/ui/CompletenessBadge';
import { InboxItemDialog, type InboxItemDialogData } from './InboxItemDialog';

export interface InboxArticleItem {
  id: string;
  title: string;
  createdAt: string;
  completenessScore: number;
  authors: string[];
  year: number | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  abstractText: string | null;
  keywords: string[];
  folderId: string | null;
  tagIds: string[];
  projectIds: string[];
  originalFilename: string | null;
  jobStatus: string | null;
}

const STATUS_META: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  PENDING: { label: 'Na fila', icon: Clock, className: 'text-neutral-400' },
  RUNNING: { label: 'Processando', icon: Loader2, className: 'text-accent animate-spin' },
  SUCCEEDED: { label: 'Metadados extraídos', icon: CheckCircle2, className: 'text-green-500' },
  FAILED: { label: 'Extração falhou — edite manualmente', icon: AlertCircle, className: 'text-amber-500' },
};

export function InboxList({
  items,
  folders,
  tags,
  projects,
}: {
  items: InboxArticleItem[];
  folders: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  projects: { id: string; name: string }[];
}) {
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const openItem = items.find((i) => i.id === openArticleId);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <FileText className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Nenhum artigo na Inbox no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const status = item.jobStatus ? STATUS_META[item.jobStatus] : undefined;
        const StatusIcon = status?.icon ?? Clock;

        return (
          <Card
            key={item.id}
            className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
            onClick={() => setOpenArticleId(item.id)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <FileText className="h-5 w-5 text-neutral-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span>{item.originalFilename}</span>
                <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                {status && (
                  <span className={`inline-flex items-center gap-1 ${status.className}`}>
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                )}
              </div>
            </div>

            <CompletenessBadge score={item.completenessScore} />
          </Card>
        );
      })}

      {openItem && (
        <InboxItemDialog
          open={!!openItem}
          onOpenChange={(open) => setOpenArticleId(open ? openItem.id : null)}
          item={
            {
              articleId: openItem.id,
              metadata: {
                title: openItem.title,
                authors: openItem.authors,
                year: openItem.year,
                journal: openItem.journal,
                doi: openItem.doi,
                url: openItem.url,
                abstractText: openItem.abstractText,
                keywords: openItem.keywords,
              },
              folderId: openItem.folderId,
              tagIds: openItem.tagIds,
              projectIds: openItem.projectIds,
            } satisfies InboxItemDialogData
          }
          folders={folders}
          tags={tags}
          projects={projects}
        />
      )}
    </div>
  );
}
