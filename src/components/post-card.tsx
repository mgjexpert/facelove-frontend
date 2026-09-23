import Image from "next/image";
import { LockKeyhole, Globe2, Heart, Images } from "lucide-react";
import type { VisiblePost } from "@/lib/media/types";
import { MediaCard } from "./media-card";
import { LockedMedia } from "./locked-media";

export function PostCard({ post, access, live, author = "Ana Oliveira", username = "anaoliveira" }: { post: VisiblePost; access: boolean; live: boolean; author?: string; username?: string }) {
  const mediaLab = post.id.startsWith("media-pack-");
  return (
    <article className="post-card">
      <div className="post-author">
        <div className="post-avatar">{mediaLab ? <Images size={19} aria-hidden="true" /> : username === "anaoliveira" ? <Image src="/images/ana-fictional-cover.jpg" alt="" fill sizes="42px" /> : author.slice(0,1)}</div>
        <div><strong>{mediaLab ? "FaceLove Spaces" : author}</strong><span>{mediaLab ? "Álbum privado" : `@${username}`} · {new Date(post.publishedAt + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}</span></div>
        <span className="post-visibility">{post.visibility === "public" ? <Globe2 size={15} /> : <LockKeyhole size={15} />}{post.visibility === "public" ? "Público" : post.visibility === "access_link" ? "Convite" : "Reservado"}</span>
      </div>
      {post.locked ? <LockedMedia visibility={post.visibility} /> : <>
        <p className="post-caption">{post.caption}</p>
        <div className={`post-media ${post.assets.length > 1 ? "post-media-multi" : ""}`}>
          {post.assets.map(asset => <MediaCard key={asset.key} asset={asset} access={access} live={live} />)}
        </div>
      </>}
      <div className="post-foot"><Heart size={17} /><span>Space de demonstração</span></div>
    </article>
  );
}
