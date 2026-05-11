import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        const publicPaths = ['/', '/login', '/register'];
        if (publicPaths.includes(pathname)) return true;

        if (
          pathname.startsWith('/api/auth/') ||
          pathname === '/api/health'
        ) {
          return true;
        }

        if (pathname.startsWith('/dashboard')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/login',
    '/register',
  ],
};
