import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const expected = process.env.SCHEDULER_PASSWORD;
  if (!expected) {
    console.error('[api/login] SCHEDULER_PASSWORD is not set');
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const submitted = formData.get('password');

  console.log(
    '[api/login] submitted password?',
    submitted ? 'present' : 'missing'
  );

  if (String(submitted) === String(expected)) {
    console.log('[api/login] password OK, setting cookie and redirecting to /');
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.set('scheduler_auth', '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  console.warn('[api/login] wrong password, redirecting back to /login');
  const url = new URL('/login?error=1', request.url);
  return NextResponse.redirect(url);
}
