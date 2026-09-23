export type Visibility = "public" | "followers" | "private" | "access_link";
export type MediaKind = "image" | "video";
export type MediaProvider = "demo" | "gateway" | "mega" | "google_drive" | "supabase" | "cloudflare" | "mux" | "external";

export interface MediaAsset {
  key: string;
  provider: MediaProvider;
  mediaType: MediaKind;
  mimeType?: string;
  title: string;
  visibility: Visibility;
  thumbnailReference?: string;
  packId?: string;
}

export interface MediaPack {
  id: string;
  title: string;
  mediaType: MediaKind;
  assetKeys: string[];
}

export interface VisiblePack extends Omit<MediaPack, "assetKeys"> {
  count: number;
  locked: boolean;
}

export interface PlaybackSource {
  kind: MediaKind;
  url: string;
  mimeType?: string;
  posterUrl?: string;
  supportsRange: boolean;
}

export interface Post {
  id: string;
  publishedAt: string;
  caption: string;
  visibility: Visibility;
  mediaKeys: string[];
}

export interface VisiblePost extends Omit<Post, "mediaKeys"> {
  locked: boolean;
  assets: MediaAsset[];
}
