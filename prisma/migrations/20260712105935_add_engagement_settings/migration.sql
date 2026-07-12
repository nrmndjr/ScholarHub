-- CreateTable
CREATE TABLE "EngagementSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gamificationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "showBadges" BOOLEAN NOT NULL DEFAULT true,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT true,
    "enabledReminderTypes" JSONB NOT NULL DEFAULT '["STALLED_ARTICLE","ALMOST_DONE","DAILY_GOAL","INBOX_PENDING"]',
    "reminderDays" JSONB NOT NULL DEFAULT '[]',
    "reminderTime" TEXT,
    "dailyGoalMinutes" INTEGER,
    "weeklyGoalMinutes" INTEGER,
    "monthlyGoalMinutes" INTEGER,
    "pausedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngagementSettings_userId_key" ON "EngagementSettings"("userId");

-- AddForeignKey
ALTER TABLE "EngagementSettings" ADD CONSTRAINT "EngagementSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
