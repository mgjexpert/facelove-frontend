import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

type Status = { albumId: string; expiresAt: string | null; active: boolean; available: boolean };
const secret = () => process.env.FACELOVE_DEMO_COOKIE_SECRET || "";
const name = (albumId: string) => `facelove_album_${albumId}`;
const signature = (albumId: string, hash: string, expiry: number) =>
  createHmac("sha256", secret()).update(`${albumId}:${hash}:${expiry}`).digest("hex");
const equal = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

async function gatewayAccess(hash: string, method: "GET" | "POST" = "GET"): Promise<Status | null> {
  if (!process.env.MEDIA_GATEWAY_URL || !process.env.MEDIA_GATEWAY_TOKEN) return null;
  const url = new URL("/v1/access", process.env.MEDIA_GATEWAY_URL);
  url.searchParams.set("hash", hash);
  try {
    const response = await fetch(url, { method, headers: { Authorization: `Bearer ${process.env.MEDIA_GATEWAY_TOKEN}` }, cache: "no-store" });
    return response.ok ? response.json() as Promise<Status> : null;
  } catch { return null; }
}

export async function inspectInvite(token: string) {
  if (!/^[a-zA-Z0-9_-]{32,128}$/.test(token)) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  const state = await gatewayAccess(hash);
  return state && state.available ? { hash, ...state } : null;
}

export async function redeemInvite(token: string) {
  const invite = await inspectInvite(token);
  if (!invite || secret().length < 32) return null;
  const redeemed = await gatewayAccess(invite.hash, "POST");
  if (!redeemed) return null;
  const expires = Math.min(Date.now() + 30 * 24 * 3600_000, redeemed.expiresAt ? Date.parse(redeemed.expiresAt) : Infinity);
  const value = `${invite.hash}.${expires}.${signature(redeemed.albumId, invite.hash, expires)}`;
  return { albumId: redeemed.albumId, value, expires: new Date(expires) };
}

export async function hasAlbumAccess(albumId: string) {
  if (!/^[a-f0-9-]{36}$/.test(albumId) || secret().length < 32) return false;
  const raw = (await cookies()).get(name(albumId))?.value;
  if (!raw) return false;
  const [hash, timestamp, mac] = raw.split(".");
  const expiry = Number(timestamp);
  if (!/^[a-f0-9]{64}$/.test(hash || "") || !Number.isSafeInteger(expiry) || expiry <= Date.now() || !mac ||
      !equal(mac, signature(albumId, hash, expiry))) return false;
  const status = await gatewayAccess(hash);
  return Boolean(status?.active && status.albumId === albumId);
}

export { name as albumCookieName };
