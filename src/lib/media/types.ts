export type Visibility = "public" | "followers" | "private" | "access_link";
export type MediaKind = "image" | "video";
export type MediaProvider = "mega" | "google_drive" | "supabase" | "cloudflare" | "mux" | "external";

export interface MediaAsset {
  key: string;
  provider: MediaProvider;
  mediaType: MediaKind;
  mimeType?: string;
  title: string;
  visibility: Visibility;
  thumbnailReference?: string;
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
