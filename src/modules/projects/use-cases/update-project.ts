import type { PrismaClient } from '@/generated/prisma/client';
import { NotFoundError } from '@/lib/errors';
import { projectSchema, type ProjectInput } from '@/lib/validation/project.schema';

export async function updateProject(
  projectId: string,
  userId: string,
  rawInput: ProjectInput,
  deps: { prisma: PrismaClient }
) {
  const input = projectSchema.parse(rawInput);

  const project = await deps.prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Projeto não encontrado');

  return deps.prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name,
      description: input.description || null,
      objective: input.objective || null,
      researchQuestion: input.researchQuestion || null,
      hypotheses: input.hypotheses,
      keywords: input.keywords,
      color: input.color || null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });
}

export async function deleteProject(projectId: string, userId: string, deps: { prisma: PrismaClient }) {
  const project = await deps.prisma.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new NotFoundError('Projeto não encontrado');

  await deps.prisma.project.delete({ where: { id: projectId } });
}
