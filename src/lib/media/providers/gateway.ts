import "server-only";
import type { MediaAsset } from "../types";

export function isGatewayConfigured() {
  return Boolean(process.env.MEDIA_GATEWAY_URL && process.env.MEDIA_GATEWAY_TOKEN);
}

export async function getGatewayCatalog(): Promise<MediaAsset[] | null> {
  if (!isGatewayConfigured()) return null;
  try {
    const response = await fetch(new URL("/v1/catalog", process.env.MEDIA_GATEWAY_URL), {
      headers: { Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const body = await response.json() as { assets?: MediaAsset[] };
    return body.assets ?? null;
  } catch { return null; }
}

export async function proxyMedia(key: string, range?: string, method: "GET" | "HEAD" = "GET") {
  if (!isGatewayConfigured()) return null;
  const gatewayUrl = new URL(`/v1/media/${encodeURIComponent(key)}`, process.env.MEDIA_GATEWAY_URL);
  return fetch(gatewayUrl, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}`,
      ...(range ? { Range: range } : {}),
    },
    cache: "no-store",
  });
}
