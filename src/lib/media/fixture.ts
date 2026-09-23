import fixturePosts from "../../../fixtures/ana-posts.json";
import type { MediaAsset, Post, Visibility } from "./types";

const images = Array.from({ length: 6 }, (_, index): MediaAsset => ({
  key: `ana-img-${String(index + 1).padStart(3, "0")}`,
  provider: "demo",
  mediaType: "image",
  mimeType: "image/jpeg",
  title: `Fotografia ${index + 1}`,
  visibility: index < 4 ? "public" : "access_link",
}));
const videos = Array.from({ length: 4 }, (_, index): MediaAsset => ({
  key: `ana-video-${String(index + 1).padStart(3, "0")}`,
  provider: "demo",
  mediaType: "video",
  mimeType: "video/mp4",
  title: `Vídeo ${index + 1}`,
  visibility: index < 2 ? "public" : "access_link",
  thumbnailReference: `ana-img-${String(index < 2 ? index + 1 : index + 3).padStart(3, "0")}`,
}));

export const mediaFixture = [...images, ...videos];
export const postsFixture = fixturePosts as Post[];
export function assetByKey(key: string) { return mediaFixture.find(asset => asset.key === key); }
export function canView(visibility: Visibility, access: boolean) {
  return visibility === "public" || (visibility === "access_link" && access);
}
