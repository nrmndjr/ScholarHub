'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic } from 'lucide-react';
import { cn } from '@/lib/utils';

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Blocks were plain text before this editor existed, so legacy content has no tags.
// Detect that case and wrap/escape it into paragraphs instead of feeding raw text to
// the HTML parser (which could otherwise mangle stray "<"/">" characters).
function toEditorHtml(raw: string): string {
  if (!raw) return '';
  if (/<\/?[a-z][\s\S]*>/i.test(raw)) return raw;
  return raw
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

export function RichTextBlockEditor({
  initialContent,
  onSave,
  onChange,
}: {
  initialContent: string;
  onSave: (html: string) => Promise<void>;
  onChange?: (html: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const initialHtml = toEditorHtml(initialContent);
  const lastSaved = useRef(initialHtml);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
        link: false,
        underline: false,
        strike: false,
      }),
      Placeholder.configure({ placeholder: 'Escreva livremente aqui...' }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class:
          'text-sm leading-relaxed focus:outline-none min-h-[3.5rem] [&_p]:mb-1 last:[&_p]:mb-0 [&_strong]:font-semibold',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      if (html === lastSaved.current) return;
      lastSaved.current = html;
      setSaving(true);
      onSave(html).finally(() => setSaving(false));
    },
  });

  if (!editor) return null;

  return (
    <div>
      <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 has-[:focus]:opacity-100">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
            editor.isActive('bold') && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          )}
          aria-label="Negrito"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
            editor.isActive('italic') && 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          )}
          aria-label="Itálico"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
      {saving && <span className="mt-1 block text-[10px] text-neutral-400">Salvando...</span>}
    </div>
  );
}
