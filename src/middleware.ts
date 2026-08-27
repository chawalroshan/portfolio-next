import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Edge middleware uses ONLY the edge-safe config (no Prisma/bcrypt).
// The `authorized` callback in auth.config.ts decides access to /admin/*.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Guard the admin area. Next internals/static assets are excluded automatically.
  matcher: ['/admin/:path*'],
};
