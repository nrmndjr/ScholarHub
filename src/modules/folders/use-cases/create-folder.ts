import type { PrismaClient } from '@/generated/prisma/client';
import { ValidationError } from '@/lib/errors';

export function createFolder(input: { userId: string; name: string; color?: string }, deps: { prisma: PrismaClient }) {
  const name = input.name.trim();
  if (!name) throw new ValidationError('Nome da pasta é obrigatório');

  return deps.prisma.folder.create({ data: { userId: input.userId, name, color: input.color } });
}
