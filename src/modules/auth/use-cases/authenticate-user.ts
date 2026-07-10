import type { PrismaClient } from '@/generated/prisma/client';
import { verifyPassword } from '../infra/password';
import { loginSchema } from '@/lib/validation/auth.schema';

export async function authenticateUser(
  credentials: Record<string, unknown> | undefined,
  deps: { prisma: PrismaClient }
) {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  const user = await deps.prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, name: user.name, email: user.email, image: user.image };
}
