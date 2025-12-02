import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const password = process.env.SCHEDULER_PASSWORD;
  const formData = await request.formData();
  const submitted = formData.get('password');

  if (password && submitted === password) {
    const isProd = process.env.NODE_ENV === 'production';
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.set('scheduler_auth', '1', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  const url = new URL('/login?error=1', request.url);
  return NextResponse.redirect(url);
}
