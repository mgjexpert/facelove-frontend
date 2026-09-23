import "server-only";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { isGatewayConfigured } from "./gateway";

// Synthetic media only. This provider is active when no external gateway is configured.
// Keep the HTTP Range behavior aligned with facelove-conteudo/src/http/range.mjs.
const directory = join(process.cwd(), "src/lib/media/demo-assets");
const files: Record<string, { file: string; mimeType: string }> = Object.fromEntries([
  ...Array.from({ length: 6 }, (_, index) => [
    `ana-img-${String(index + 1).padStart(3, "0")}`,
    { file: `photo-${index + 1}.jpg`, mimeType: "image/jpeg" },
  ]),
  ...Array.from({ length: 4 }, (_, index) => [
    `ana-video-${String(index + 1).padStart(3, "0")}`,
    { file: `clip-${index + 1}.mp4`, mimeType: "video/mp4" },
  ]),
] as [string, { file: string; mimeType: string }][]);

export function isDemoProviderActive() {
  return !process.env.MEDIA_GATEWAY_URL && !process.env.MEDIA_GATEWAY_TOKEN && process.env.VERCEL_ENV !== "production";
}

function byteRange(header: string | null, size: number) {
  if (!header) return { status: 200, start: 0, end: size - 1 };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2])) return null;
  const suffix = !match[1];
  const start = suffix ? Math.max(0, size - Number(match[2])) : Number(match[1]);
  const end = suffix ? size - 1 : match[2] ? Number(match[2]) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || (suffix && (!Number.isSafeInteger(Number(match[2])) || Number(match[2]) <= 0)) || start >= size || start > end) return null;
  return { status: 206, start, end: Math.min(end, size - 1, start + 2 * 1024 * 1024 - 1) };
}

export async function serveDemoMedia(key: string, header: string | null, method: "GET" | "HEAD") {
  if (!isDemoProviderActive()) return null;
  const item = files[key];
  if (!item) return new Response(null, { status: 404 });
  const path = join(directory, item.file);
  const { size } = await stat(path);
  const range = byteRange(header, size);
  const headers = new Headers({
    "Content-Type": item.mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set("Content-Length", String(range.end - range.start + 1));
  if (range.status === 206) headers.set("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
  if (method === "HEAD") return new Response(null, { status: range.status, headers });
  const stream = createReadStream(path, { start: range.start, end: range.end });
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status: range.status, headers });
}
