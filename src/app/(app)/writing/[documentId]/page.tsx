import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getWritingDocument } from '@/modules/writing/use-cases/get-document';
import { listInsertableContent } from '@/modules/writing/use-cases/list-insertable-content';
import { WritingWorkspace } from './_components/WritingWorkspace';

export default async function WritingDocumentPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  const user = await getCurrentUserOrThrow();

  const [document, insertableContent] = await Promise.all([
    getWritingDocument(documentId, user.id, { prisma }),
    listInsertableContent(user.id, undefined, { prisma }),
  ]);

  return <WritingWorkspace document={document} initialInsertableContent={insertableContent} />;
}
