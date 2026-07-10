'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export function CommentComposerDialog({
  open,
  onOpenChange,
  excerptText,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excerptText: string;
  onSubmit: (text: string) => Promise<void>;
}) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSubmit(text.trim());
      setText('');
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Adicionar comentário" className="max-w-md">
      <div className="space-y-3">
        <p className="line-clamp-3 rounded-lg bg-neutral-50 p-2 text-xs italic text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          &ldquo;{excerptText}&rdquo;
        </p>
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Seu comentário..." autoFocus />
        <Button onClick={handleSubmit} disabled={saving || !text.trim()} className="w-full">
          {saving ? 'Salvando...' : 'Salvar comentário'}
        </Button>
      </div>
    </Dialog>
  );
}
