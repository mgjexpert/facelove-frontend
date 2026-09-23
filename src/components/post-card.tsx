import Image from "next/image";
import { LockKeyhole, Globe2, Heart, Images } from "lucide-react";
import type { VisiblePost } from "@/lib/media/types";
import { MediaCard } from "./media-card";
import { LockedMedia } from "./locked-media";

export function PostCard({ post, access, live }: { post: VisiblePost; access: boolean; live: boolean }) {
  const mediaLab = post.id.startsWith("media-pack-");
  return (
    <article className="post-card">
      <div className="post-author">
        <div className="post-avatar">{mediaLab ? <Images size={19} aria-hidden="true" /> : <Image src="/images/ana-fictional-cover.jpg" alt="" fill sizes="42px" />}</div>
        <div><strong>{mediaLab ? "FaceLove Media Lab" : "Ana Oliveira"}</strong><span>{mediaLab ? "Packs de teste" : "@anaoliveira"} · {new Date(post.publishedAt + "T12:00:00").toLocaleDateString("pt-PT", { day: "numeric", month: "short" })}</span></div>
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
