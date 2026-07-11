import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { searchHighlights } from '@/modules/knowledge-base/use-cases/search-highlights';
import { listTagsWithCounts } from '@/modules/knowledge-base/use-cases/list-tags-with-counts';
import { listKnowledgeBaseFilterOptions } from '@/modules/knowledge-base/use-cases/list-filter-options';
import { listSavedFilters } from '@/modules/knowledge-base/use-cases/manage-saved-filters';
import { KnowledgeBaseWorkspace } from './_components/KnowledgeBaseWorkspace';

export default async function KnowledgeBasePage() {
  const user = await getCurrentUserOrThrow();

  const [highlights, tags, filterOptions, savedFilters] = await Promise.all([
    searchHighlights(user.id, {}, { prisma }),
    listTagsWithCounts(user.id, { prisma }),
    listKnowledgeBaseFilterOptions(user.id, { prisma }),
    listSavedFilters(user.id, { prisma }),
  ]);

  return (
    <KnowledgeBaseWorkspace
      initialHighlights={highlights}
      tags={tags}
      filterOptions={filterOptions}
      initialSavedFilters={savedFilters}
    />
  );
}
