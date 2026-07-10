import type { PrismaClient } from '@/generated/prisma/client';

const STALE_THRESHOLD_MS = 2 * 60 * 1000;

export async function reapStaleJobs(deps: { prisma: PrismaClient }) {
  const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

  const result = await deps.prisma.processingJob.updateMany({
    where: { status: 'RUNNING', startedAt: { lt: threshold } },
    data: { status: 'PENDING', startedAt: null },
  });

  return result.count;
}
