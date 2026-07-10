import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function getCurrentUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}
