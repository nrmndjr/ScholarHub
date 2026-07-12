'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function UploadDropzone() {
  const router = useRouter();
  const [batch, setBatch] = useState<{ total: number; done: number } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setBatch({ total: acceptedFiles.length, done: 0 });

      const results = await Promise.allSettled(
        acceptedFiles.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!res.ok) {
              const body = await res.json().catch(() => null);
              throw new Error(body?.error ?? `Falha ao enviar ${file.name}`);
            }
          } finally {
            setBatch((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
          }
        })
      );

      setBatch(null);

      const failures = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length > 0) {
        failures.forEach((f) => toast.error(f.reason?.message ?? 'Erro ao enviar arquivo'));
      }
      const successCount = results.length - failures.length;
      if (successCount > 0) {
        toast.success(`${successCount} artigo(s) enviado(s) para a Inbox`);
      }

      router.refresh();
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors',
        isDragActive
          ? 'border-accent bg-accent/5'
          : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600'
      )}
    >
      <input {...getInputProps()} />
      {batch ? (
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      ) : (
        <UploadCloud className="h-6 w-6 text-neutral-400" />
      )}
      <p className="text-sm font-medium">
        {batch
          ? `Enviando ${batch.done} de ${batch.total} arquivo${batch.total === 1 ? '' : 's'}...`
          : isDragActive
            ? 'Solte os PDFs aqui'
            : 'Arraste PDFs aqui ou clique para selecionar'}
      </p>
      {batch && batch.total > 1 && (
        <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(batch.done / batch.total) * 100}%` }}
          />
        </div>
      )}
      <p className="text-xs text-neutral-500 dark:text-neutral-400">Apenas arquivos .pdf, até 50MB cada</p>
    </div>
  );
}
