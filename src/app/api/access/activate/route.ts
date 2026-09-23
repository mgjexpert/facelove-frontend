import { NextRequest, NextResponse } from "next/server";
import { accessTokenStatus, COOKIE_NAME, createAccessCookie } from "@/lib/access";
import { albumCookieName, redeemInvite } from "@/lib/album-access";
import { publicRows, supabaseConfigured } from "@/lib/supabase-data";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return new NextResponse("Origem inválida", { status: 403 });
  }
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const redeemed = await redeemInvite(token);
  if (redeemed) {
    const [album] = await publicRows<{space_id:string}>("albums", `id=eq.${redeemed.albumId}&select=space_id`);
    const [space] = album ? await publicRows<{profile_id:string}>("spaces", `id=eq.${album.space_id}&select=profile_id`) : [];
    const [profile] = space ? await publicRows<{username:string}>("profiles", `id=eq.${space.profile_id}&select=username`) : [];
    const response = NextResponse.redirect(new URL(`/@${profile?.username || "anaoliveira"}?access=granted`, request.url), 303);
    response.cookies.set(albumCookieName(redeemed.albumId), redeemed.value, {
      httpOnly: true, secure: process.env.VERCEL_ENV === "production" || request.nextUrl.protocol === "https:",
      sameSite: "lax", path: "/", expires: redeemed.expires,
    });
    return response;
  }
  if (supabaseConfigured() || accessTokenStatus(token) !== "valid") {
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
