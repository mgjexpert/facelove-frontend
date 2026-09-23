import { NextRequest, NextResponse } from "next/server";
import { hasDemoAccess } from "@/lib/access";
import { assetByKey, canView } from "@/lib/media/fixture";
import { getGatewayCatalog, proxyMedia } from "@/lib/media/providers/gateway";
import { isDemoProviderActive, serveDemoMedia } from "@/lib/media/providers/demo";
import { hasAlbumAccess } from "@/lib/album-access";
import { publicRows, supabaseConfigured, type PublicMedia } from "@/lib/supabase-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
type Context = { params: Promise<{ key: string }> };

async function handle(request: NextRequest, context: Context, method: "GET" | "HEAD") {
  const { key } = await context.params;
  const space = request.nextUrl.searchParams.get("space") || "anaoliveira";
  if (!/^[a-z0-9_]{3,32}$/.test(space)) return NextResponse.json({ error: "Space inválido" }, { status: 400 });
  const fixture = assetByKey(key);
  const publicMedia = !fixture && /^[a-f0-9-]{36}$/.test(key) && supabaseConfigured()
    ? (await publicRows<PublicMedia>("media_assets", `id=eq.${key}&visibility=eq.public&provider=eq.supabase&select=id,space_id,provider,external_id,media_type,mime_type,title`))[0] : null;
  if (publicMedia) {
    const segments = publicMedia.external_id.split("/");
    if (segments.some(segment => !/^[a-zA-Z0-9_.-]+$/.test(segment) || segment === "." || segment === ".."))
      return NextResponse.json({ error: "Referência inválida" }, { status: 400 });
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (!base) return NextResponse.json({ error: "Storage indisponível" }, { status: 503 });
    const storageUrl = new URL(`/storage/v1/object/public/public-media/${segments.map(encodeURIComponent).join("/")}`, base);
    try {
      const upstream = await fetch(storageUrl, { method, headers: request.headers.has("range") ? { Range: request.headers.get("range")! } : {}, cache: "no-store" });
      const headers = new Headers({ "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" });
      for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
        const value = upstream.headers.get(name); if (value) headers.set(name, value);
      }
      return new NextResponse(method === "HEAD" ? null : upstream.body, { status: upstream.status, headers });
    } catch { return NextResponse.json({ error: "Media indisponível" }, { status: 502 }); }
  }
  // The gateway catalogue contains metadata only. The provider stream is not
  // opened until a permitted asset has been found and access is verified.
  const catalog = fixture ? null : await getGatewayCatalog(space);
  const asset = fixture ?? catalog?.assets.find(item => item.key === key);
  if (!asset || (fixture && (supabaseConfigured() || (fixture.visibility !== "public" && !isDemoProviderActive())))) {
    return NextResponse.json({ error: "Asset não encontrado" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const access = fixture ? await hasDemoAccess() : asset.packId ? await hasAlbumAccess(asset.packId) : false;
  if (!canView(asset.visibility, access)) {
    return NextResponse.json({ error: "Acesso necessário" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    if (fixture) {
      const demo = await serveDemoMedia(key, request.headers.get("range"), method);
      return demo ?? NextResponse.json({ error: "Media indisponível" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const upstream = await proxyMedia(key, request.headers.get("range") ?? undefined, method, space);
    if (!upstream) return NextResponse.json({ error: "Gateway indisponível" }, { status: 503 });
    const headers = new Headers();
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    return new NextResponse(method === "HEAD" ? null : upstream.body, { status: upstream.status, headers });
  } catch {
    return NextResponse.json({ error: "Media indisponível" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
export const GET = (request: NextRequest, context: Context) => handle(request, context, "GET");
export const HEAD = (request: NextRequest, context: Context) => handle(request, context, "HEAD");
