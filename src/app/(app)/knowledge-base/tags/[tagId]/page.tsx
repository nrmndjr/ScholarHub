import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getTagDetail } from '@/modules/knowledge-base/use-cases/get-tag-detail';
import { TagDetailView } from './_components/TagDetailView';

export default async function TagDetailPage({ params }: { params: Promise<{ tagId: string }> }) {
  const { tagId } = await params;
  const user = await getCurrentUserOrThrow();
  const detail = await getTagDetail(tagId, user.id, { prisma });

  return <TagDetailView detail={detail} />;
}
