import { NextRequest, NextResponse } from "next/server";
import { hasDemoAccess } from "@/lib/access";
import { assetByKey, canView } from "@/lib/media/fixture";
import { getGatewayCatalog, proxyMedia } from "@/lib/media/providers/gateway";
import { isDemoProviderActive, serveDemoMedia } from "@/lib/media/providers/demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
type Context = { params: Promise<{ key: string }> };

async function handle(request: NextRequest, context: Context, method: "GET" | "HEAD") {
  const { key } = await context.params;
  const fixture = assetByKey(key);
  // The gateway catalogue contains metadata only. The provider stream is not
  // opened until a permitted asset has been found and access is verified.
  const catalog = fixture ? null : await getGatewayCatalog();
  const asset = fixture ?? catalog?.assets.find(item => item.key === key);
  if (!asset || (fixture && fixture.visibility !== "public" && !isDemoProviderActive())) {
    return NextResponse.json({ error: "Asset não encontrado" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const access = await hasDemoAccess();
  if (!canView(asset.visibility, access)) {
    return NextResponse.json({ error: "Acesso necessário" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    if (fixture) {
      const demo = await serveDemoMedia(key, request.headers.get("range"), method);
      return demo ?? NextResponse.json({ error: "Media indisponível" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const upstream = await proxyMedia(key, request.headers.get("range") ?? undefined, method);
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
