import type { MediaAsset, PlaybackSource } from "./types";
import { canView } from "./fixture";

export function resolvePlaybackSource(asset: MediaAsset, access: boolean): PlaybackSource | null {
  if (!canView(asset.visibility, access)) return null;
  return {
    kind: asset.mediaType,
    url: `/api/media/${encodeURIComponent(asset.key)}`,
    mimeType: asset.mimeType,
    posterUrl: asset.thumbnailReference ? `/api/media/${encodeURIComponent(asset.thumbnailReference)}` : undefined,
    supportsRange: asset.mediaType === "video",
  };
}
