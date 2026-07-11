'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Loader2 } from 'lucide-react';
import { updateSummaryAction } from '../../actions';

export function SummaryTab({ articleId, initialContent }: { articleId: string; initialContent: unknown }) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Escreva seu resumo pessoal, fichamento ou reflexões sobre o artigo...' }),
    ],
    content: (initialContent as object) ?? '',
    editorProps: {
      attributes: {
        class:
          'max-w-none text-sm leading-relaxed focus:outline-none min-h-[50vh] [&_p]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      setSaveStatus('saving');
      saveTimer.current = setTimeout(async () => {
        await updateSummaryAction(articleId, editor.getJSON());
        setSaveStatus('saved');
        idleTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
      }, 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="mb-1.5 flex h-4 items-center justify-end gap-1.5 text-[11px] text-neutral-400">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Salvando...
          </>
        )}
        {saveStatus === 'saved' && 'Salvo'}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
