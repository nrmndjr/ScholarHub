'use client';

import { useMemo, useState } from 'react';
import { LibraryCardView } from './LibraryCardView';
import { LibraryListView } from './LibraryListView';
import { LibraryTableView } from './LibraryTableView';
import { BulkActionBar, type OrganizeOptions } from './BulkActionBar';
import type { LibraryArticleItem } from './types';

export function LibraryContent({
  items,
  view,
  organizeOptions,
}: {
  items: LibraryArticleItem[];
  view: 'cards' | 'list' | 'table';
  organizeOptions: OrganizeOptions;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filters/sorting can change which items are visible independently of bulk actions —
  // derive the visible-only selection at render time instead of syncing state, so a
  // stale id from a previous filter never gets counted or acted on.
  const visibleSelectedIds = useMemo(() => {
    const visibleIds = new Set(items.map((i) => i.id));
    return new Set([...selectedIds].filter((id) => visibleIds.has(id)));
  }, [selectedIds, items]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds(visibleSelectedIds.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-3">
      <BulkActionBar
        selectedIds={Array.from(visibleSelectedIds)}
        totalCount={items.length}
        allSelected={items.length > 0 && visibleSelectedIds.size === items.length}
        onToggleSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        organizeOptions={organizeOptions}
      />

      {view === 'list' ? (
        <LibraryListView items={items} selectedIds={visibleSelectedIds} onToggleSelect={toggle} />
      ) : view === 'table' ? (
        <LibraryTableView items={items} selectedIds={visibleSelectedIds} onToggleSelect={toggle} />
      ) : (
        <LibraryCardView items={items} selectedIds={visibleSelectedIds} onToggleSelect={toggle} />
      )}
    </div>
  );
}
