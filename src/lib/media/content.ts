import { canView, mediaFixture, postsFixture } from "./fixture";
import { getGatewayCatalog } from "./providers/gateway";
import { isDemoProviderActive, isPublicShowcaseEnabled } from "./providers/demo";
import type { MediaAsset, VisiblePack, VisiblePost } from "./types";

export async function getSpaceContent(access: boolean) {
  const catalog = await getGatewayCatalog();
  const fullDemo = isDemoProviderActive();
  const showcase = isPublicShowcaseEnabled();
  const demoAssets = showcase ? mediaFixture.filter(asset => fullDemo || asset.visibility === "public") : [];
  const realAssets = catalog?.assets ?? [];
  const assets = [...demoAssets, ...realAssets];
  const byKey = new Map(assets.map(asset => [asset.key, asset]));
  const posts: VisiblePost[] = postsFixture.filter(post => fullDemo || (showcase && post.visibility === "public")).map(post => {
    const permitted = canView(post.visibility, access);
    return {
      id: post.id, publishedAt: post.publishedAt,
      caption: permitted ? post.caption : "",
      visibility: post.visibility, locked: !permitted,
      assets: permitted ? post.mediaKeys.map(key => byKey.get(key)).filter((item): item is MediaAsset => Boolean(item)) : [],
    };
  });
  const packs: VisiblePack[] = (catalog?.packs ?? []).map(pack => ({
    id: pack.id, title: pack.title, mediaType: pack.mediaType,
    count: realAssets.filter(asset => asset.packId === pack.id).length,
    locked: !access,
  })).filter(pack => pack.count > 0);
  for (const pack of packs) {
    posts.push({
      id: `media-pack-${pack.id}`, publishedAt: "2026-09-20", visibility: "access_link",
      caption: access ? `${pack.title} · ${pack.count} ficheiros de teste. Os media não representam a pessoa do perfil.` : "",
      locked: !access,
      assets: access ? realAssets.filter(asset => asset.packId === pack.id).slice(0, 3) : [],
    });
  }
  const mode: "demo" | "showcase" | "gateway" | "unavailable" = catalog ? "gateway" : fullDemo ? "demo" : showcase ? "showcase" : "unavailable";
  return { assets, posts, packs, live: mode !== "unavailable", mode };
}
