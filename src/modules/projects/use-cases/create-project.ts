import type { PrismaClient } from '@/generated/prisma/client';
import { projectSchema, type ProjectInput } from '@/lib/validation/project.schema';

export async function createProject(userId: string, rawInput: ProjectInput, deps: { prisma: PrismaClient }) {
  const input = projectSchema.parse(rawInput);

  return deps.prisma.project.create({
    data: {
      userId,
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
