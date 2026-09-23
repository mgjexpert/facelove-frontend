import Image from "next/image";
import { ImageIcon, Play } from "lucide-react";
import type { MediaAsset } from "@/lib/media/types";
import { resolvePlaybackSource } from "@/lib/media/resolve-playback";
import { MediaPlayer } from "./media-player";

export function MediaCard({ asset, access, live, compact = false }: { asset: MediaAsset; access: boolean; live: boolean; compact?: boolean }) {
  const source = resolvePlaybackSource(asset, access);
  if (!source) return null;
  return (
    <article className={`media-card ${compact ? "media-card-compact" : ""}`} aria-label={asset.title}>
      {asset.mediaType === "image" ? (
        <div className="media-stage image-stage">
          {live ? <Image src={source.url} alt={asset.title} fill sizes={compact ? "(max-width: 700px) 50vw, 260px" : "(max-width: 700px) 100vw, 600px"} unoptimized /> :
            <div className="media-placeholder"><ImageIcon size={30} /><span>{asset.title}</span><small>Imagem disponível ao ligar o media lab</small></div>}
        </div>
      ) : <MediaPlayer source={source} title={asset.title} live={live} />}
      <div className="media-meta"><span>{asset.title}</span><span className="media-kind">{asset.mediaType === "video" ? <><Play size={12} /> Vídeo</> : "Fotografia"}</span></div>
    </article>
  );
}
