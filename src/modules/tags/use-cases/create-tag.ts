import type { PrismaClient } from '@/generated/prisma/client';
import { ValidationError } from '@/lib/errors';

export async function createTag(input: { userId: string; name: string; color?: string }, deps: { prisma: PrismaClient }) {
  const name = input.name.trim();
  if (!name) throw new ValidationError('Nome da tag é obrigatório');

  const existing = await deps.prisma.tag.findUnique({ where: { userId_name: { userId: input.userId, name } } });
  if (existing) return existing;

  return deps.prisma.tag.create({ data: { userId: input.userId, name, color: input.color } });
}
