import type { InviteStatus } from "@/lib/album-access";
import type { GatewayCatalog } from "./providers/gateway";

// Enumerate keys in the server's stable album order. The browser receives only
// the keys allowed by this function, and /api/media repeats the same check.
export function allowedSpaceKeys(catalog: GatewayCatalog, grant: InviteStatus | null) {
  const allowed = new Set<string>();
  if (!grant?.active || !grant.spaceId) return allowed;
  const assets = new Map(catalog.assets.map(asset => [asset.key, asset]));
  let images = 0, videos = 0;
  for (const pack of catalog.packs) {
    for (const key of pack.assetKeys) {
      const asset = assets.get(key);
      if (!asset || asset.packId !== pack.id) continue;
      if (asset.mediaType === "image" && (grant.imageLimit === null || images < grant.imageLimit)) {
        allowed.add(key); images++;
      } else if (asset.mediaType === "video" && (grant.videoLimit === null || videos < grant.videoLimit)) {
        allowed.add(key); videos++;
      }
    }
  }
  return allowed;
}
