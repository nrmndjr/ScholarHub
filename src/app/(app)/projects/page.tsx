import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ProjectsGrid } from './_components/ProjectsGrid';

export default async function ProjectsPage() {
  const user = await getCurrentUserOrThrow();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Projetos</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Cada projeto representa uma pesquisa: dissertação, revisão sistemática, artigo ou disciplina.
        </p>
      </div>

      <ProjectsGrid
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          color: p.color,
          articleCount: p._count.articles,
        }))}
      />
    </div>
  );
}
