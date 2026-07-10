'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AddArticlesDialog } from './AddArticlesDialog';

export function LinkArticlesButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        <Link2 className="h-3.5 w-3.5" />
        Vincular artigos
      </Button>
      <AddArticlesDialog open={open} onOpenChange={setOpen} projectId={projectId} />
    </>
  );
}
