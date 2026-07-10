import type { PrismaClient } from '@/generated/prisma/client';
import { hashPassword } from '../infra/password';
import { ValidationError } from '@/lib/errors';
import { registerSchema, type RegisterInput } from '@/lib/validation/auth.schema';

export async function registerUser(
  input: RegisterInput,
  deps: { prisma: PrismaClient }
) {
  const { name, email, password } = registerSchema.parse(input);

  const existing = await deps.prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ValidationError('Já existe uma conta com este e-mail');
  }

  const passwordHash = await hashPassword(password);

  const user = await deps.prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { id: user.id, name: user.name, email: user.email };
}
