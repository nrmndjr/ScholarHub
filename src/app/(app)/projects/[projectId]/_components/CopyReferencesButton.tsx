'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatArticleAbnt, type AbntArticleInput } from '@/modules/reference-formatting/abnt';

export function CopyReferencesButton({ articles }: { articles: AbntArticleInput[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (articles.length === 0) {
      toast.error('Nenhum artigo vinculado a este projeto ainda');
      return;
    }

    const text = articles.map((a) => formatArticleAbnt(a).plainText).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Referências copiadas em ABNT');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      Copiar todas as referências em ABNT
    </Button>
  );
}
