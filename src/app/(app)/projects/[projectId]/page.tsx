import { notFound } from 'next/navigation';
import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getProjectDetail } from '@/modules/projects/use-cases/get-project-detail';
import { NotFoundError } from '@/lib/errors';
import { ProjectHeader } from './_components/ProjectHeader';
import { ProjectMiniDashboard } from './_components/ProjectMiniDashboard';
import { ProjectArticlesList } from './_components/ProjectArticlesList';
import { CopyReferencesButton } from './_components/CopyReferencesButton';
import { LinkArticlesButton } from './_components/LinkArticlesButton';

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const user = await getCurrentUserOrThrow();

  let detail;
  try {
    detail = await getProjectDetail(projectId, user.id, { prisma });
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const { project, articles, dashboard } = detail;

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          objective: project.objective,
          researchQuestion: project.researchQuestion,
          hypotheses: Array.isArray(project.hypotheses) ? (project.hypotheses as string[]) : [],
          keywords: Array.isArray(project.keywords) ? (project.keywords as string[]) : [],
          color: project.color,
          startDate: project.startDate ? project.startDate.toISOString().slice(0, 10) : null,
          endDate: project.endDate ? project.endDate.toISOString().slice(0, 10) : null,
        }}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Artigos ({articles.length})
        </h2>
        <div className="flex gap-2">
          <LinkArticlesButton projectId={project.id} />
          <CopyReferencesButton
            articles={articles.map((a) => ({
              title: a.title,
              authors: a.authors.map((au) => au.author.name),
              journalName: a.journal?.name,
              year: a.year,
              volume: a.volume,
              issue: a.issue,
              pages: a.pages,
              doi: a.doi,
              url: a.url,
            }))}
          />
        </div>
      </div>

      <ProjectArticlesList
        projectId={project.id}
        articles={articles.map((a) => ({
          id: a.id,
          title: a.title,
          authors: a.authors.map((au) => au.author.name),
          year: a.year,
          status: a.status,
          highlightsCount: a._count.highlights,
          commentsCount: a._count.comments,
        }))}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">Dashboard do projeto</h2>
        <ProjectMiniDashboard
          topAuthors={dashboard.topAuthors}
          topJournals={dashboard.topJournals}
          yearDistribution={dashboard.yearDistribution}
        />
      </div>
    </div>
  );
}
