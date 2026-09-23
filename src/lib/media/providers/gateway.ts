import "server-only";
import type { MediaAsset, MediaPack } from "../types";

export interface GatewayCatalog { assets: MediaAsset[]; packs: MediaPack[] }

export function isGatewayConfigured() {
  if (!process.env.MEDIA_GATEWAY_URL || !process.env.MEDIA_GATEWAY_TOKEN) return false;
  try {
    const url = new URL(process.env.MEDIA_GATEWAY_URL);
    return process.env.VERCEL_ENV === "production" ? url.protocol === "https:" : ["https:", "http:"].includes(url.protocol);
  } catch { return false; }
}

export async function getGatewayCatalog(space = "anaoliveira"): Promise<GatewayCatalog | null> {
  if (!isGatewayConfigured()) return null;
  try {
    const url = new URL("/v1/catalog", process.env.MEDIA_GATEWAY_URL);
    url.searchParams.set("space", space);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}` },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const body = await response.json() as { assets?: Array<Partial<MediaAsset>>; packs?: Array<Partial<MediaPack>> };
    if (!Array.isArray(body.assets) || !Array.isArray(body.packs)) return null;
    const packs: MediaPack[] = body.packs.filter((pack): pack is MediaPack =>
      typeof pack.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(pack.id) &&
      typeof pack.title === "string" && ["image", "video", "mixed"].includes(pack.mediaType ?? "") &&
      Array.isArray(pack.assetKeys) && pack.assetKeys.every(key => typeof key === "string"),
    );
    const assets: MediaAsset[] = body.assets.filter(asset =>
      typeof asset.key === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(asset.key) &&
      typeof asset.title === "string" && ["image", "video"].includes(asset.mediaType ?? "") &&
      asset.visibility === "access_link" && typeof asset.packId === "string" &&
      packs.some(pack => pack.id === asset.packId && (pack.mediaType === "mixed" || pack.mediaType === asset.mediaType) && pack.assetKeys.includes(asset.key!)),
    ).map(asset => ({
      key: asset.key!, provider: "gateway", mediaType: asset.mediaType!, mimeType: asset.mimeType,
      title: asset.title!, visibility: "access_link", packId: asset.packId,
      thumbnailReference: asset.thumbnailReference, spaceSlug: space,
    }));
    return { assets, packs };
  } catch { return null; }
}

export async function proxyMedia(key: string, range?: string, method: "GET" | "HEAD" = "GET", space = "anaoliveira") {
  if (!isGatewayConfigured()) return null;
  const gatewayUrl = new URL(`/v1/media/${encodeURIComponent(key)}`, process.env.MEDIA_GATEWAY_URL);
  gatewayUrl.searchParams.set("space", space);
  return fetch(gatewayUrl, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}`,
      ...(range ? { Range: range } : {}),
    },
    cache: "no-store",
  });
}
