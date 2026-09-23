import { NextRequest, NextResponse } from "next/server";
import { accessTokenStatus, COOKIE_NAME, createAccessCookie } from "@/lib/access";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return new NextResponse("Origem inválida", { status: 403 });
  }
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  if (accessTokenStatus(token) !== "valid") {
    return NextResponse.redirect(new URL("/access?invalid=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/@anaoliveira?access=granted", request.url), 303);
  const cookie = createAccessCookie();
  response.cookies.set(COOKIE_NAME, cookie.value, {
    httpOnly: true, secure: process.env.VERCEL_ENV === "production" || request.nextUrl.protocol === "https:", sameSite: "lax",
    path: "/", expires: cookie.expires,
  });
  return response;
}
