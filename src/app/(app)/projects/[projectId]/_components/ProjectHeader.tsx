'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { ProjectFormDialog, type ProjectFormDefaults } from '../../_components/ProjectFormDialog';
import { deleteProjectAction } from '../../actions';

export function ProjectHeader({
  project,
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    objective: string | null;
    researchQuestion: string | null;
    hypotheses: string[];
    keywords: string[];
    color: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir o projeto "${project.name}"? Os artigos vinculados não serão excluídos.`)) return;
    setDeleting(true);
    try {
      await deleteProjectAction(project.id);
      toast.success('Projeto excluído');
      router.push('/projects');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir projeto');
      setDeleting(false);
    }
  }

  const defaults: ProjectFormDefaults = {
    id: project.id,
    name: project.name,
    description: project.description ?? '',
    objective: project.objective ?? '',
    researchQuestion: project.researchQuestion ?? '',
    hypotheses: project.hypotheses,
    keywords: project.keywords,
    color: project.color ?? '#6366f1',
    startDate: project.startDate ?? '',
    endDate: project.endDate ?? '',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.color ?? '#6366f1' }} />
          <h1 className="text-lg font-semibold">{project.name}</h1>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {project.description && <p className="text-sm text-neutral-600 dark:text-neutral-300">{project.description}</p>}

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        {project.objective && (
          <div>
            <p className="text-xs font-medium text-neutral-400">Objetivo</p>
            <p className="text-neutral-700 dark:text-neutral-200">{project.objective}</p>
          </div>
        )}
        {project.researchQuestion && (
          <div>
            <p className="text-xs font-medium text-neutral-400">Pergunta de pesquisa</p>
            <p className="text-neutral-700 dark:text-neutral-200">{project.researchQuestion}</p>
          </div>
        )}
      </div>

      {project.hypotheses.length > 0 && (
        <div>
          <p className="text-xs font-medium text-neutral-400">Hipóteses</p>
          <ul className="list-inside list-disc text-sm text-neutral-700 dark:text-neutral-200">
            {project.hypotheses.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} defaults={defaults} />
    </div>
  );
}
