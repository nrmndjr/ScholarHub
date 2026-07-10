'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { updateSummaryAction } from '../../actions';

export function SummaryTab({ articleId, initialContent }: { articleId: string; initialContent: unknown }) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      saveTimer.current = setTimeout(() => {
        updateSummaryAction(articleId, editor.getJSON());
      }, 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <EditorContent editor={editor} />
    </div>
  );
}
