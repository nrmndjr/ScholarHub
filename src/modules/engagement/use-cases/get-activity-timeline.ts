import type { PrismaClient } from '@/generated/prisma/client';
import { BADGE_DEFINITIONS, type TimelineGroup } from '../domain/entities';

const LOOKBACK_DAYS = 30;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function headingFor(key: string, todayKey: string, yesterdayKey: string): string {
  if (key === todayKey) return 'Hoje';
  if (key === yesterdayKey) return 'Ontem';
  const daysAgo = Math.round((new Date(`${todayKey}T00:00:00Z`).getTime() - new Date(`${key}T00:00:00Z`).getTime()) / 86_400_000);
  if (daysAgo <= 6) return 'Esta semana';
  if (daysAgo <= 13) return 'Semana passada';
  return 'Mais antigo';
}

export async function getActivityTimeline(userId: string, deps: { prisma: PrismaClient }): Promise<TimelineGroup[]> {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);

  const [completedArticles, addedArticles, highlights, comments, projects, writingDocuments, achievements] =
    await Promise.all([
      deps.prisma.article.findMany({
        where: { userId, status: 'CONCLUIDO', updatedAt: { gte: since } },
        select: { updatedAt: true },
      }),
      deps.prisma.article.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      deps.prisma.highlight.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      deps.prisma.comment.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      deps.prisma.project.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      deps.prisma.writingDocument.findMany({ where: { userId, createdAt: { gte: since } }, select: { createdAt: true } }),
      deps.prisma.userAchievement.findMany({ where: { userId, unlockedAt: { gte: since } }, select: { badgeKey: true, unlockedAt: true } }),
    ]);

  const countsByDay = new Map<
    string,
    { completed: number; added: number; highlights: number; comments: number; projects: number; documents: number }
  >();

  function bump(date: Date, field: 'completed' | 'added' | 'highlights' | 'comments' | 'projects' | 'documents') {
    const key = dateKey(date);
    const entry = countsByDay.get(key) ?? { completed: 0, added: 0, highlights: 0, comments: 0, projects: 0, documents: 0 };
    entry[field]++;
    countsByDay.set(key, entry);
  }

  completedArticles.forEach((a) => bump(a.updatedAt, 'completed'));
  addedArticles.forEach((a) => bump(a.createdAt, 'added'));
  highlights.forEach((h) => bump(h.createdAt, 'highlights'));
  comments.forEach((c) => bump(c.createdAt, 'comments'));
  projects.forEach((p) => bump(p.createdAt, 'projects'));
  writingDocuments.forEach((d) => bump(d.createdAt, 'documents'));

  const badgeByDay = new Map<string, string[]>();
  for (const a of achievements) {
    const key = dateKey(a.unlockedAt);
    const label = BADGE_DEFINITIONS.find((b) => b.key === a.badgeKey)?.label ?? a.badgeKey;
    badgeByDay.set(key, [...(badgeByDay.get(key) ?? []), label]);
  }

  const allDayKeys = new Set([...countsByDay.keys(), ...badgeByDay.keys()]);
  const todayKey = dateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = dateKey(yesterdayDate);

  const groups = new Map<string, TimelineGroup>();
  const groupOrder = ['Hoje', 'Ontem', 'Esta semana', 'Semana passada', 'Mais antigo'];

  Array.from(allDayKeys)
    .sort((a, b) => (a < b ? 1 : -1))
    .forEach((key) => {
      const counts = countsByDay.get(key);
      const badges = badgeByDay.get(key) ?? [];
      const entries: string[] = [];

      if (counts) {
        if (counts.completed > 0) entries.push(`Concluiu ${counts.completed} artigo${counts.completed === 1 ? '' : 's'}.`);
        if (counts.added > 0) entries.push(`Adicionou ${counts.added} artigo${counts.added === 1 ? '' : 's'}.`);
        if (counts.highlights > 0) entries.push(`Criou ${counts.highlights} destaque${counts.highlights === 1 ? '' : 's'}.`);
        if (counts.comments > 0) entries.push(`Registrou ${counts.comments} comentário${counts.comments === 1 ? '' : 's'}.`);
        if (counts.projects > 0) entries.push(`Criou ${counts.projects} projeto${counts.projects === 1 ? '' : 's'}.`);
        if (counts.documents > 0) entries.push(`Criou ${counts.documents} documento${counts.documents === 1 ? '' : 's'} de escrita.`);
      }
      badges.forEach((label) => entries.push(`Conquistou o badge "${label}".`));

      if (entries.length === 0) return;

      const heading = headingFor(key, todayKey, yesterdayKey);
      const group = groups.get(heading) ?? { heading, entries: [] };
      group.entries.push(...entries.map((label) => ({ label })));
      groups.set(heading, group);
    });

  return groupOrder.map((heading) => groups.get(heading)).filter((g): g is TimelineGroup => !!g);
}
