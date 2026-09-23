"use client";
import { useState } from "react";
import { Grid2X2, Images, Video, Info } from "lucide-react";
import type { MediaAsset, VisiblePack, VisiblePost } from "@/lib/media/types";
import { MediaCard } from "./media-card";
import { PostCard } from "./post-card";
import { LockedMedia } from "./locked-media";

type Tab = "posts" | "photos" | "videos" | "about";
const tabs: { id: Tab; name: string; icon: typeof Grid2X2 }[] = [
  { id: "posts", name: "Posts", icon: Grid2X2 },
  { id: "photos", name: "Fotos", icon: Images },
  { id: "videos", name: "Vídeos", icon: Video },
  { id: "about", name: "Sobre", icon: Info },
];

export function ProfileTabs({ posts, assets, packs, access, live, mode, bio, author = "Ana Oliveira", username = "anaoliveira" }: {
  posts: VisiblePost[]; assets: MediaAsset[]; packs: VisiblePack[]; access: boolean; live: boolean; mode: "demo" | "showcase" | "gateway" | "unavailable"; bio: string; author?: string; username?: string;
}) {
  const [tab, setTab] = useState<Tab>("posts");
  const filtered = assets.filter(asset => asset.mediaType === (tab === "photos" ? "image" : "video"));
  const activePacks = packs.filter(pack => pack.mediaType === "mixed" || pack.mediaType === (tab === "photos" ? "image" : "video"));
  return (
    <div className="profile-body">
      <div className="tabs" role="tablist" aria-label="Conteúdo do Space">
        {tabs.map(item => <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)}>
          <item.icon size={17} strokeWidth={1.8} /><span>{item.name}</span>
        </button>)}
      </div>
      <div className="feed-layout">
        <div className="feed-main">
          {tab === "posts" && <div className="feed-list">{posts.map(post => <PostCard key={post.id} post={post} access={access} live={live} author={author} username={username} />)}</div>}
          {(tab === "photos" || tab === "videos") && <>
            {activePacks.map(pack => <div className="pack-summary" key={pack.id}>
              <div><span className="eyebrow">ÁLBUM RESERVADO</span><h2>{pack.title}</h2><p>{pack.count} {pack.mediaType === "image" ? "fotografias" : pack.mediaType === "video" ? "vídeos" : "ficheiros"} · acesso por convite</p></div>
              {pack.locked && <LockedMedia visibility="access_link" />}
            </div>)}
            {filtered.length ? <div className="gallery-grid">{filtered.map(asset => <MediaCard key={asset.key} asset={asset} access={access} live={live} compact />)}</div> :
              !activePacks.length && <div className="empty-panel">Ainda não há conteúdo disponível nesta secção.</div>}
          </>}
          {tab === "about" && <div className="about-panel"><p className="eyebrow">SOBRE ESTE SPACE</p><h2>Um lugar para partilhar</h2><p>{bio}</p><p className="muted-copy">Perfil editorial em preparação. A identidade ilustrativa não identifica pessoas nos ficheiros privados.</p></div>}
        </div>
        <aside className="feed-aside">
          <p className="eyebrow">BEM-VINDO AO SPACE</p>
          <h3>Mais perto de quem escolhe partilhar.</h3>
          <p>Explore publicações, fotos e vídeos. Alguns momentos exigem um convite.</p>
          <div className="aside-divider" />
          <span>{mode === "demo" || mode === "showcase" ? "Media ficcional de demonstração" : mode === "gateway" ? "Media lab ligado · packs por convite" : "Media lab indisponível"}</span>
        </aside>
      </div>
    </div>
  );
}
