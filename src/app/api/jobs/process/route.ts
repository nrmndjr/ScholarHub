import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { processPendingJobs } from '@/modules/processing/use-cases/process-pending-jobs';
import { reapStaleJobs } from '@/modules/processing/use-cases/reap-stale-jobs';

export async function POST() {
  await reapStaleJobs({ prisma });
  const result = await processPendingJobs({ prisma, storage: getStorage() });
  return NextResponse.json(result);
}
