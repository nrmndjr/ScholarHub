'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  authors: z.string(),
  year: z.string(),
  journal: z.string(),
  doi: z.string(),
  url: z.string(),
  abstractText: z.string(),
  keywords: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export interface ArticleMetadataDefaults {
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  abstractText: string | null;
  keywords: string[];
}

function splitList(value: string) {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function MetadataEditForm({
  defaults,
  onSave,
}: {
  defaults: ArticleMetadataDefaults;
  onSave: (data: {
    title: string;
    authors: string[];
    year?: number;
    journal?: string;
    doi?: string;
    url?: string;
    abstractText?: string;
    keywords: string[];
  }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaults.title,
      authors: defaults.authors.join(', '),
      year: defaults.year ? String(defaults.year) : '',
      journal: defaults.journal ?? '',
      doi: defaults.doi ?? '',
      url: defaults.url ?? '',
      abstractText: defaults.abstractText ?? '',
      keywords: defaults.keywords.join(', '),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSave({
        title: values.title,
        authors: splitList(values.authors),
        year: values.year ? Number(values.year) : undefined,
        journal: values.journal || undefined,
        doi: values.doi || undefined,
        url: values.url || undefined,
        abstractText: values.abstractText || undefined,
        keywords: splitList(values.keywords),
      });
      toast.success('Metadados salvos');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar metadados');
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Título</label>
        <Input {...register('title')} />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Autores (separados por vírgula)
        </label>
        <Input {...register('authors')} placeholder="Maria Silva, João Souza" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Ano</label>
          <Input {...register('year')} inputMode="numeric" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Periódico</label>
          <Input {...register('journal')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">DOI</label>
          <Input {...register('doi')} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">URL</label>
          <Input {...register('url')} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Resumo</label>
        <Textarea rows={4} {...register('abstractText')} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          Palavras-chave (separadas por vírgula)
        </label>
        <Input {...register('keywords')} />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar metadados'}
      </Button>
    </form>
  );
}
