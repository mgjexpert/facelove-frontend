import "server-only";

export type SpaceProfile = { id: string; username: string; display_name: string; bio: string; avatar_path: string | null; cover_path: string | null; editorial_draft: boolean };
export type SpaceAlbum = { id: string; space_id: string; title: string; description: string; media_type: "image" | "video" | "mixed"; visibility: string; sort_order: number };
export type SpacePost = { id: string; caption: string; published_at: string | null };
export type PublicMedia = { id: string; space_id: string; provider: "supabase"; external_id: string; media_type: "image" | "video"; mime_type: string | null; title: string };
export type PostMedia = { post_id: string; media_asset_id: string; position: number };

export function supabaseConfigured() {
  return Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY));
}

export async function publicRows<T>(table: string, query: string): Promise<T[]> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!base || !key) return [];
  const response = await fetch(new URL(`/rest/v1/${table}?${query}`, base), {
    headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store", signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Falha ao carregar ${table}`);
  return response.json() as Promise<T[]>;
}

export async function getProfiles() {
  return publicRows<SpaceProfile>("profiles", "select=id,username,display_name,bio,avatar_path,cover_path,editorial_draft&order=display_name.asc");
}

export async function getSpace(username: string) {
  const [profile] = await publicRows<SpaceProfile>("profiles", `username=eq.${encodeURIComponent(username)}&select=id,username,display_name,bio,avatar_path,cover_path,editorial_draft`);
  if (!profile) return null;
  const [space] = await publicRows<{ id: string }>("spaces", `profile_id=eq.${profile.id}&status=eq.published&select=id`);
  if (!space) return null;
  const [albums, posts, media] = await Promise.all([
    publicRows<SpaceAlbum>("albums", `space_id=eq.${space.id}&select=id,space_id,title,description,media_type,visibility,sort_order&order=sort_order.asc`),
    publicRows<SpacePost>("posts", `space_id=eq.${space.id}&status=eq.published&visibility=eq.public&select=id,caption,published_at&order=published_at.desc`),
    publicRows<PublicMedia>("media_assets", `space_id=eq.${space.id}&provider=eq.supabase&visibility=eq.public&select=id,space_id,provider,external_id,media_type,mime_type,title`),
  ]);
  const postMedia = posts.length ? await publicRows<PostMedia>("post_media", `post_id=in.(${posts.map(post => post.id).join(",")})&select=post_id,media_asset_id,position&order=position.asc`) : [];
  return { profile, space, albums, posts, media, postMedia };
}
