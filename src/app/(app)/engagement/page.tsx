import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getEngagementOverview } from '@/modules/engagement/use-cases/get-engagement-overview';
import { getReadingStreak } from '@/modules/engagement/use-cases/get-reading-streak';
import { listGoalsWithProgress } from '@/modules/engagement/use-cases/manage-goals';
import { getAchievements } from '@/modules/engagement/use-cases/get-achievements';
import { getJourneyStatus } from '@/modules/engagement/use-cases/get-journey';
import { getReminders } from '@/modules/engagement/use-cases/get-reminders';
import { getActivityTimeline } from '@/modules/engagement/use-cases/get-activity-timeline';
import { getHabitStats } from '@/modules/engagement/use-cases/get-habit-stats';
import { getOrCreateSettings } from '@/modules/engagement/use-cases/manage-settings';
import { OverviewStats } from './_components/OverviewStats';
import { MotivationBanner } from './_components/MotivationBanner';
import { RemindersPanel } from './_components/RemindersPanel';
import { StreakHeatmap } from './_components/StreakHeatmap';
import { JourneyPanel } from './_components/JourneyPanel';
import { GoalsList } from './_components/GoalsList';
import { AchievementsGrid } from './_components/AchievementsGrid';
import { ActivityTimeline } from './_components/ActivityTimeline';
import { HabitStatsCharts } from './_components/HabitStatsCharts';

export default async function EngagementPage() {
  const user = await getCurrentUserOrThrow();

  const [overview, streak, goals, achievements, journey, reminders, timeline, habitStats, settings] = await Promise.all([
    getEngagementOverview(user.id, { prisma }),
    getReadingStreak(user.id, { prisma }),
    listGoalsWithProgress(user.id, { prisma }),
    getAchievements(user.id, { prisma }),
    getJourneyStatus(user.id, { prisma }),
    getReminders(user.id, { prisma }),
    getActivityTimeline(user.id, { prisma }),
    getHabitStats(user.id, { prisma }),
    getOrCreateSettings(user.id, { prisma }),
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

      <RemindersPanel reminders={reminders} />

      <OverviewStats overview={overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={settings.gamificationEnabled ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <StreakHeatmap
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            activityByDate={streak.activityByDate}
          />
        </div>
        {settings.gamificationEnabled && <JourneyPanel journey={journey} />}
      </div>

      <GoalsList goals={goals} />

      {settings.gamificationEnabled && settings.showBadges && <AchievementsGrid badges={achievements} />}

      <ActivityTimeline groups={timeline} />

      <HabitStatsCharts stats={habitStats} />
    </div>
  );
}
