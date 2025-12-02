import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const expected = process.env.SCHEDULER_PASSWORD;

  if (!expected) {
    console.error("SCHEDULER_PASSWORD is not set in the environment");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const submitted = formData.get("password");

  if (String(submitted) === String(expected)) {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.set("scheduler_auth", "1", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  }

  const url = new URL("/login?error=1", request.url);
  return NextResponse.redirect(url);
}
