import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const password = process.env.SCHEDULER_PASSWORD;
  const formData = await request.formData();
  const submitted = formData.get('password');

  if (password && submitted === password) {
    const res = NextResponse.redirect(new URL('/', request.url));
    res.headers.set(
      'Set-Cookie',
      `scheduler_auth=1; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
    );
    return res;
  }

  const url = new URL('/login?error=1', request.url);
  return NextResponse.redirect(url);
}
