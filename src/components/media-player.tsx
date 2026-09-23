"use client";
import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import type { PlaybackSource } from "@/lib/media/types";

export function MediaPlayer({ source, title, live }: { source: PlaybackSource; title: string; live: boolean }) {
  const [playing, setPlaying] = useState(false);
  if (!live) {
    return <div className="media-stage media-video-placeholder"><Play size={35} /><span>{title}</span><small>Vídeo disponível ao ligar o media lab</small></div>;
  }
  if (!playing) {
    return (
      <button type="button" className="media-stage media-video-placeholder video-start" onClick={() => setPlaying(true)} aria-label={`Reproduzir ${title}`}>
        {source.posterUrl && <Image src={source.posterUrl} alt="" fill sizes="(max-width: 700px) 100vw, 600px" unoptimized className="video-poster" />}
        <span className="video-poster-scrim" />
        <span className="play-disc"><Play size={25} fill="currentColor" /></span>
        <span>{title}</span>
        <small>Reproduzir vídeo</small>
      </button>
    );
  }
  return (
    <video className="media-stage video-element" controls autoPlay playsInline preload="metadata" poster={source.posterUrl}>
      <source src={source.url} type={source.mimeType || "video/mp4"} />
      O seu navegador não suporta este vídeo.
    </video>
  );
}
