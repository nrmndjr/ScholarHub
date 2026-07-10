export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // On Vercel there's no long-running process for setInterval to live in -
  // processing is instead triggered by after() on upload and by the Vercel
  // Cron backstop hitting /api/jobs/process (see vercel.json).
  if (process.env.VERCEL) return;

  const { prisma } = await import('@/lib/prisma');
  const { getStorage } = await import('@/lib/storage/storage-factory');
  const { processPendingJobs } = await import('@/modules/processing/use-cases/process-pending-jobs');
  const { reapStaleJobs } = await import('@/modules/processing/use-cases/reap-stale-jobs');

  const storage = getStorage();

  setInterval(async () => {
    try {
      await reapStaleJobs({ prisma });
      await processPendingJobs({ prisma, storage });
    } catch (error) {
      console.error('[processing-poller] error', error);
    }
  }, 5000);
}
