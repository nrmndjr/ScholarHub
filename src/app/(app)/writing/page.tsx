import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { listWritingDocuments } from '@/modules/writing/use-cases/list-documents';
import { WritingDocumentsGrid } from './_components/WritingDocumentsGrid';

export default async function WritingPage() {
  const user = await getCurrentUserOrThrow();

  const [documents, projects] = await Promise.all([
    listWritingDocuments(user.id, { prisma }),
    prisma.project.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Painel de Escrita</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Conecte suas leituras à escrita: monte capítulos, revisões e artigos a partir dos destaques, comentários e
          resumos já produzidos.
        </p>
      </div>

      <WritingDocumentsGrid documents={documents} projects={projects} />
    </div>
  );
}
