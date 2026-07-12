import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getEngagementOverview } from '@/modules/engagement/use-cases/get-engagement-overview';
import { getReadingStreak } from '@/modules/engagement/use-cases/get-reading-streak';
import { listGoalsWithProgress } from '@/modules/engagement/use-cases/manage-goals';
import { getAchievements } from '@/modules/engagement/use-cases/get-achievements';
import { getJourneyStatus } from '@/modules/engagement/use-cases/get-journey';
import { OverviewStats } from './_components/OverviewStats';
import { MotivationBanner } from './_components/MotivationBanner';
import { StreakHeatmap } from './_components/StreakHeatmap';
import { JourneyPanel } from './_components/JourneyPanel';
import { GoalsList } from './_components/GoalsList';
import { AchievementsGrid } from './_components/AchievementsGrid';

export default async function EngagementPage() {
  const user = await getCurrentUserOrThrow();

  const [overview, streak, goals, achievements, journey] = await Promise.all([
    getEngagementOverview(user.id, { prisma }),
    getReadingStreak(user.id, { prisma }),
    listGoalsWithProgress(user.id, { prisma }),
    getAchievements(user.id, { prisma }),
    getJourneyStatus(user.id, { prisma }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Engajamento</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Acompanhe seus hábitos de leitura e a consistência da sua pesquisa.
        </p>
      </div>

      <MotivationBanner message={overview.motivation} />

      <OverviewStats overview={overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StreakHeatmap
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            activityByDate={streak.activityByDate}
          />
        </div>
        <JourneyPanel journey={journey} />
      </div>

      <GoalsList goals={goals} />

      <AchievementsGrid badges={achievements} />
    </div>
  );
}
