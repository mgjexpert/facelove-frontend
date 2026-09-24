import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type InviteStatus = { albumId: string | null; spaceId: string | null; tier: string | null;
  imageLimit: number | null; videoLimit: number | null;
  expiresAt: string | null; active: boolean; available: boolean; revoked?: boolean };
const secret = () => process.env.FACELOVE_DEMO_COOKIE_SECRET || "";
const name = (albumId: string) => `facelove_album_${albumId}`;
const spaceName = (spaceId: string) => `facelove_space_${spaceId}`;
const signature = (albumId: string, hash: string, expiry: number) =>
  createHmac("sha256", secret()).update(`${albumId}:${hash}:${expiry}`).digest("hex");
const equal = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

async function gatewayAccess(hash: string, method: "GET" | "POST" = "GET"): Promise<InviteStatus | null> {
  if (!process.env.MEDIA_GATEWAY_URL || !process.env.MEDIA_GATEWAY_TOKEN) return null;
  const url = new URL("/v1/access", process.env.MEDIA_GATEWAY_URL);
  url.searchParams.set("hash", hash);
  try {
    const response = await fetch(url, { method, headers: { Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}` }, cache: "no-store" });
    return response.ok ? response.json() as Promise<InviteStatus> : null;
  } catch { return null; }
}

export async function lookupInvite(token: string) {
  if (!/^[a-zA-Z0-9_-]{32,128}$/.test(token)) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const state = await gatewayAccess(hash);
  return state ? { hash, ...state } : null;
}

export async function inspectInvite(token: string) {
  const state = await lookupInvite(token);
  return state?.available ? state : null;
}

export async function redeemInvite(token: string) {
  const invite = await inspectInvite(token);
  if (!invite || secret().length < 32) return null;
  const redeemed = await gatewayAccess(invite.hash, "POST");
  if (!redeemed || !redeemed.albumId && !redeemed.spaceId) return null;
  const expires = Math.min(Date.now() + 30 * 24 * 3600_000, redeemed.expiresAt ? Date.parse(redeemed.expiresAt) : Infinity);
  const scopeId = redeemed.albumId || redeemed.spaceId!;
  const value = `${invite.hash}.${expires}.${signature(scopeId, invite.hash, expires)}`;
  return { albumId: redeemed.albumId, spaceId: redeemed.spaceId, value, expires: new Date(expires) };
}

async function inspectCookie(scopeId: string, cookieName: string) {
  if (!/^[a-f0-9-]{36}$/.test(scopeId) || secret().length < 32) return null;
  const raw = (await cookies()).get(cookieName)?.value;
  if (!raw) return null;
  const [hash, timestamp, mac] = raw.split(".");
  const expiry = Number(timestamp);
  if (!/^[a-f0-9]{64}$/.test(hash || "") || !Number.isSafeInteger(expiry) || expiry <= Date.now() || !mac ||
      !equal(mac, signature(scopeId, hash, expiry))) return null;
  const status = await gatewayAccess(hash);
  return status?.active ? status : null;
}

export async function hasAlbumAccess(albumId: string) {
  const status = await inspectCookie(albumId, name(albumId));
  return Boolean(status && status.albumId === albumId);
}

export async function getSpaceAccess(spaceId: string) {
  const status = await inspectCookie(spaceId, spaceName(spaceId));
  return status && status.spaceId === spaceId ? status : null;
}

export { name as albumCookieName };
export { spaceName as spaceCookieName };
