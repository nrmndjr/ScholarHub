import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/modules/auth/use-cases/authenticate-user';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  // Vercel terminates TLS at its edge and forwards over HTTP, so Auth.js
  // can't verify the host itself; trust it since AUTH_URL pins the origin.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: (credentials) => authenticateUser(credentials, { prisma }),
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.userId = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) session.user.id = token.userId as string;
      return session;
    },
  },
});
