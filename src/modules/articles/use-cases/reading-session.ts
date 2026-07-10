import type { PrismaClient } from '@/generated/prisma/client';

export async function closeOpenReadingSession(
  articleId: string,
  userId: string,
  endPage: number,
  deps: { prisma: PrismaClient }
) {
  const openSession = await deps.prisma.readingSession.findFirst({
    where: { articleId, userId, endedAt: null },
    orderBy: { startedAt: 'desc' },
  });
  if (!openSession) return;

  const endedAt = new Date();
  const durationSeconds = Math.max(0, Math.round((endedAt.getTime() - openSession.startedAt.getTime()) / 1000));

  await deps.prisma.readingSession.update({
    where: { id: openSession.id },
    data: { endedAt, endPage, durationSeconds },
  });
}
