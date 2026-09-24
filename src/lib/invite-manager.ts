import "server-only";

export type ManagedInvite = {
  id: string; label: string; tier: string; image_limit: number | null; video_limit: number | null;
  duration_seconds: number | null; activated_at: string | null; expires_at: string | null;
  max_uses: number | null; uses_count: number; revoked_at: string | null; created_at: string;
};

export async function inviteGateway(spaceId: string, method: "GET" | "POST", revoke = false, body?: object) {
  if (!process.env.MEDIA_GATEWAY_URL || !process.env.MEDIA_GATEWAY_TOKEN) throw new Error("Gestor de convites indisponível");
  const url = new URL(revoke ? "/v1/invites/revoke" : "/v1/invites", process.env.MEDIA_GATEWAY_URL);
  url.searchParams.set("space", spaceId);
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}`,
    ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Não foi possível gerir o convite");
  return response.json();
}
