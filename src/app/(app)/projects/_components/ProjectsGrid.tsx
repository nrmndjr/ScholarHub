'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProjectFormDialog } from './ProjectFormDialog';

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  articleCount: number;
}

export function ProjectsGrid({ projects }: { projects: ProjectSummary[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {projects.length} projeto{projects.length === 1 ? '' : 's'}
        </p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <FolderKanban className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum projeto ainda. Crie um para organizar sua pesquisa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="flex h-full flex-col gap-2 p-4 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color ?? '#6366f1' }} />
                  <h3 className="line-clamp-1 text-sm font-semibold">{project.name}</h3>
                </div>
                {project.description && (
                  <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{project.description}</p>
                )}
                <p className="mt-auto pt-2 text-xs text-neutral-400">
                  {project.articleCount} artigo{project.articleCount === 1 ? '' : 's'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ProjectFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
