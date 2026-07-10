import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage/storage-factory';
import { processPendingJobs } from '@/modules/processing/use-cases/process-pending-jobs';
import { reapStaleJobs } from '@/modules/processing/use-cases/reap-stale-jobs';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured (e.g. local dev) - leave open
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function runJobs() {
  await reapStaleJobs({ prisma });
  const result = await processPendingJobs({ prisma, storage: getStorage() });
  return NextResponse.json(result);
}

// Vercel Cron calls this endpoint with GET.
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runJobs();
}

// Kept for manual/local triggering.
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runJobs();
}
