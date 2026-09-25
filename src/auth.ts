import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { LOGIN_LIMIT, checkRateLimit, resetRateLimit } from '@/lib/rate-limit';
import { authConfig } from './auth.config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const key = `login:${email.toLowerCase()}`;
        const limit = checkRateLimit(key, LOGIN_LIMIT);
        if (!limit.allowed) {
          // Deliberately generic (same as bad credentials) to avoid
          // disclosing lockout state to scanners.
          console.warn(`[audit] login throttled for ${email} (retry in ${limit.retryAfterSec}s)`);
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          console.warn(`[audit] failed login for unknown email ${email}`);
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          console.warn(`[audit] failed login for ${email}`);
          return null;
        }

        resetRateLimit(key);
        console.info(`[audit] successful login for ${email}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
});
