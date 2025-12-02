import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authCookie = req.cookies.get('scheduler_auth');

  console.log('[middleware] path:', pathname, 'authCookie:', authCookie?.value);

  // Public routes: login UI, login API, static assets
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images')
  ) {
    console.log('[middleware] allowing public route:', pathname);
    return NextResponse.next();
  }

  if (authCookie?.value === '1') {
    console.log('[middleware] authenticated, proceeding to:', pathname);
    return NextResponse.next();
  }

  console.log('[middleware] no auth cookie, redirecting to /login from', pathname);
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}
