'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatArticleAbnt, type AbntArticleInput } from '@/modules/reference-formatting/abnt';

export function ReferenceTab({ article }: { article: AbntArticleInput }) {
  const [copied, setCopied] = useState(false);
  const reference = formatArticleAbnt(article);

  async function handleCopy() {
    await navigator.clipboard.writeText(reference.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-neutral-400">
        Referência gerada automaticamente no formato ABNT (NBR 6023). Atualiza sozinha quando os metadados mudam.
      </p>
      <div className="rounded-lg border border-neutral-200 p-3 text-sm leading-relaxed dark:border-neutral-800">
        {reference.segments.map((segment, i) => (
          <span key={i} className={segment.italic ? 'italic' : undefined}>
            {segment.text}
          </span>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        Copiar referência
      </Button>
    </div>
  );
}
