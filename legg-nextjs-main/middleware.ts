import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname === '/login' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/api/login') ||   // ONLY the login API is public
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = req.cookies.get('scheduler_auth');
  if (authCookie?.value === '1') {
    return NextResponse.next();
  }

  // No cookie -> send to login
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images).*)'],
};
