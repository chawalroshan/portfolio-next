import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config (no Prisma / bcrypt / Node APIs here).
 * Imported by src/middleware.ts AND by src/auth.ts. The Credentials provider
 * and DB lookups are added in src/auth.ts, which runs only in the Node runtime.
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // Route protection. Runs in middleware (edge). `auth` is the session.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/admin/login';

      if (isOnLogin) {
        // Already logged in? bounce to the dashboard.
        if (isLoggedIn) {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }

      if (isOnAdmin) {
        // Protected: must be logged in. Returning false redirects to signIn page.
        return isLoggedIn;
      }

      return true;
    },
    // Persist the user id/role onto the JWT and expose on the session.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'admin';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as string) ?? 'admin';
      }
      return session;
    },
  },
  providers: [], // added in src/auth.ts
} satisfies NextAuthConfig;
