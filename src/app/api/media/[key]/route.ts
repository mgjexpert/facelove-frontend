import { NextRequest, NextResponse } from "next/server";
import { hasDemoAccess } from "@/lib/access";
import { assetByKey, canView } from "@/lib/media/fixture";
import { getGatewayCatalog, proxyMedia } from "@/lib/media/providers/gateway";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ key: string }> };

async function handle(request: NextRequest, context: Context, method: "GET" | "HEAD") {
  const { key } = await context.params;
  const asset = assetByKey(key);
  if (!asset) return NextResponse.json({ error: "Asset não encontrado" }, { status: 404 });
  const access = await hasDemoAccess();
  if (!canView(asset.visibility, access)) {
    return NextResponse.json({ error: "Acesso necessário" }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const catalog = await getGatewayCatalog();
    const current = catalog?.find(item => item.key === key);
    if (!current || current.visibility !== asset.visibility || current.mediaType !== asset.mediaType) {
      return NextResponse.json({ error: "Asset indisponível" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    const upstream = await proxyMedia(key, request.headers.get("range") ?? undefined, method);
    if (!upstream) return NextResponse.json({ error: "Gateway local não configurado" }, { status: 503 });
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
