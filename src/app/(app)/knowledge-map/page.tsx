import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getKnowledgeGraph } from '@/modules/knowledge-map/use-cases/get-knowledge-graph';
import { KnowledgeMapWorkspace } from './_components/KnowledgeMapWorkspace';

export default async function KnowledgeMapPage() {
  const user = await getCurrentUserOrThrow();
  const graph = await getKnowledgeGraph(user.id, { prisma });

  return <KnowledgeMapWorkspace graph={graph} />;
}
