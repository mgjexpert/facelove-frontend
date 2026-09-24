import "server-only";
import { getSpaceAccess, hasAlbumAccess } from "@/lib/album-access";
import { allowedSpaceKeys } from "./entitlements";
import type { SpaceAlbum, SpacePost, PublicMedia, PostMedia } from "@/lib/supabase-data";
import { getGatewayCatalog, isGatewayConfigured } from "./providers/gateway";
import type { MediaAsset, VisiblePack, VisiblePost } from "./types";

export async function getPersistedContent(username: string, spaceId: string, albums: SpaceAlbum[], editorial: SpacePost[], media: PublicMedia[], postMedia: PostMedia[]) {
  const [spaceGrant, albumGrants] = await Promise.all([
    getSpaceAccess(spaceId), Promise.all(albums.map(async album => [album.id, await hasAlbumAccess(album.id)] as const)),
  ]);
  const permitted = new Map(albumGrants);
  const catalog = spaceGrant || [...permitted.values()].some(Boolean) ? await getGatewayCatalog(username) : null;
  const spaceKeys = catalog ? allowedSpaceKeys(catalog, spaceGrant) : new Set<string>();
  const publicAssets: MediaAsset[] = media.map(asset => ({ key: asset.id, provider: "supabase", mediaType: asset.media_type,
    mimeType: asset.mime_type || undefined, title: asset.title || "Publicação", visibility: "public", spaceSlug: username }));
  const publicById = new Map(publicAssets.map(asset => [asset.key, asset]));
  const assets: MediaAsset[] = [...publicAssets, ...(catalog?.assets ?? []).filter(asset =>
    permitted.get(asset.packId || "") || spaceKeys.has(asset.key))];
  const posts: VisiblePost[] = editorial.map(post => ({ id: post.id, publishedAt: (post.published_at || new Date().toISOString()).slice(0, 10),
    caption: post.caption, visibility: "public", locked: false, assets: postMedia.filter(join => join.post_id === post.id)
      .map(join => publicById.get(join.media_asset_id)).filter((item): item is MediaAsset => Boolean(item)) }));
  const packs: VisiblePack[] = albums.map(album => ({ id: album.id, title: album.title,
    mediaType: album.media_type, count: catalog?.assets.filter(asset => asset.packId === album.id).length ?? 0,
    locked: !permitted.get(album.id) && !assets.some(asset => asset.packId === album.id),
  }));
  for (const album of albums) {
    const unlocked = permitted.get(album.id) || assets.some(asset => asset.packId === album.id);
    posts.push({ id: `media-pack-${album.id}`, publishedAt: new Date().toISOString().slice(0,10),
      caption: unlocked ? `${album.title} · coleção privada.` : "", visibility: "access_link", locked: !unlocked,
      assets: unlocked ? assets.filter(asset => asset.packId === album.id).slice(0, 3) : [],
    });
  }
  return { assets, posts, packs, live: Boolean(catalog || publicAssets.length), mode: isGatewayConfigured() ? "gateway" as const : "unavailable" as const,
    access: [...permitted.values()].some(Boolean) || spaceKeys.size > 0 };
}
