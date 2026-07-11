import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function ActiveProjects({
  projects,
}: {
  projects: Array<{ id: string; name: string; color: string | null; articleCount: number }>;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold">Projetos</h2>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <FolderKanban className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
          <p className="text-xs text-neutral-400">Nenhum projeto criado ainda.</p>
          <Link href="/projects">
            <Button size="sm" variant="secondary">
              Criar projeto
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="group flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color ?? 'var(--color-accent)' }}
                  />
                  <span className="truncate font-medium group-hover:text-accent">{project.name}</span>
                </span>
                <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {project.articleCount} artigo{project.articleCount === 1 ? '' : 's'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
