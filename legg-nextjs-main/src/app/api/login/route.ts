import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expected = process.env.SCHEDULER_PASSWORD;

    // If env var isn't set or password doesn't match -> 401
    if (!expected || password !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set("sched_auth", "ok", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Optional: block other methods cleanly
export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
