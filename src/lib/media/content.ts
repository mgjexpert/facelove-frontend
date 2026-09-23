import { assetByKey, canView, mediaFixture, postsFixture } from "./fixture";
import { getGatewayCatalog } from "./providers/gateway";
import { isDemoProviderActive } from "./providers/demo";
import type { MediaAsset, VisiblePost } from "./types";

export async function getSpaceContent(access: boolean) {
  const liveCatalog = await getGatewayCatalog();
  // The fixture is authoritative for access. Gateway metadata can only enrich known keys.
  const live = new Map(liveCatalog?.map(asset => [asset.key, asset]) ?? []);
  const assets = mediaFixture.map(asset => {
    const metadata = live.get(asset.key);
    return metadata ? { ...asset, title: metadata.title, mimeType: metadata.mimeType } : asset;
  });
  const byKey = new Map(assets.map(asset => [asset.key, asset]));
  const posts: VisiblePost[] = postsFixture.map(post => {
    const permitted = canView(post.visibility, access);
    return {
      id: post.id, publishedAt: post.publishedAt,
      caption: permitted ? post.caption : "",
      visibility: post.visibility, locked: !permitted,
      assets: permitted ? post.mediaKeys.map(key => byKey.get(key) ?? assetByKey(key)).filter((item): item is MediaAsset => Boolean(item)) : [],
    };
  });
  const mode: "demo" | "gateway" | "unavailable" = isDemoProviderActive() ? "demo" : liveCatalog !== null ? "gateway" : "unavailable";
  return { assets, posts, live: mode !== "unavailable", mode };
}
