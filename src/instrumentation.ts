export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

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
