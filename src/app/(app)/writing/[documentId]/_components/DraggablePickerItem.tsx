'use client';

import type { ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export function DraggablePickerItem({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-xs transition-opacity active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900"
      style={{
        opacity: isDragging ? 0.4 : 1,
        transform: CSS.Translate.toString(transform),
        position: transform ? 'relative' : undefined,
        zIndex: transform ? 50 : undefined,
      }}
    >
      {children}
    </div>
  );
}
