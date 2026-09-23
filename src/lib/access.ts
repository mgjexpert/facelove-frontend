import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "facelove_demo_access";
const fixtureMode = () => !process.env.MEDIA_GATEWAY_URL && !process.env.MEDIA_GATEWAY_TOKEN;
const secret = () => process.env.FACELOVE_DEMO_COOKIE_SECRET || (fixtureMode() ? "fixture-only-no-real-media-secret" : "");
const equal = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const sign = (expires: number) => createHmac("sha256", secret()).update(`anaoliveira:${expires}`).digest("hex");

export type AccessStatus = "valid" | "expired" | "invalid";
export function accessTokenStatus(token: string): AccessStatus {
  if (token.length > 256 || !token) return "invalid";
  if (fixtureMode()) return token === "demo-preview" ? "valid" : "invalid";
  const configured = process.env.FACELOVE_DEMO_ACCESS_TOKEN;
  if (!configured || !secret() || !equal(token, configured)) return "invalid";
  const expiry = process.env.FACELOVE_DEMO_ACCESS_EXPIRES_AT;
  if (expiry && Date.now() >= Date.parse(expiry)) return "expired";
  return "valid";
}
export function createAccessCookie() {
  const expires = Math.min(
    Date.now() + 24 * 60 * 60 * 1000,
    process.env.FACELOVE_DEMO_ACCESS_EXPIRES_AT ? Date.parse(process.env.FACELOVE_DEMO_ACCESS_EXPIRES_AT) : Infinity,
  );
  return { value: `${expires}.${sign(expires)}`, expires: new Date(expires) };
}
export async function hasDemoAccess() {
  if (!secret()) return false;
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [expiry, signature] = raw.split(".");
  const expires = Number(expiry);
  return Number.isSafeInteger(expires) && expires > Date.now() && Boolean(signature) && equal(signature, sign(expires));
}
export { COOKIE_NAME };
