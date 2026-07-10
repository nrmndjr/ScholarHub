'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { registerUser } from '@/modules/auth/use-cases/register-user';
import { ValidationError } from '@/lib/errors';
import { z } from 'zod';

export type RegisterState = { error?: string } | undefined;

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  try {
    await registerUser({ name, email, password }, { prisma });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? 'Dados inválidos' };
    }
    if (error instanceof ValidationError) {
      return { error: error.message };
    }
    throw error;
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/inbox' });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Conta criada, mas não foi possível entrar automaticamente. Faça login.' };
    }
    throw error;
  }
}
