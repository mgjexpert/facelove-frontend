import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LockKeyhole, MapPin, MessageCircle, UserPlus } from "lucide-react";
import ana from "../../../fixtures/ana-oliveira.json";
import { hasDemoAccess } from "@/lib/access";
import { getSpaceContent } from "@/lib/media/content";
import { canView } from "@/lib/media/fixture";
import { ProfileTabs } from "@/components/profile-tabs";
import { getSpace, supabaseConfigured } from "@/lib/supabase-data";
import { getPersistedContent } from "@/lib/media/space-content";

export const dynamic = "force-dynamic";

export default async function AnaPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const decoded = decodeURIComponent(handle);
  const username = decoded.slice(1).toLowerCase();
  if (!decoded.startsWith("@") || !/^[a-z0-9_]{3,32}$/.test(username)) notFound();
  const persisted = supabaseConfigured() ? await getSpace(username) : null;
  if (supabaseConfigured() && !persisted) notFound();
  if (!persisted && username !== "anaoliveira") notFound();
  const content = persisted ? await getPersistedContent(username, persisted.space.id, persisted.albums, persisted.posts, persisted.media, persisted.postMedia) : await getSpaceContent(await hasDemoAccess());
  const { assets, posts, packs, live, mode } = content;
  const access: boolean = persisted ? ("access" in content && content.access === true) : await hasDemoAccess();
  const visibleAssets = assets.filter(asset => canView(asset.visibility, access));
  const profile = persisted?.profile;
  const displayName = profile?.display_name || ana.profile.displayName;
  const bio = profile?.bio || ana.profile.bio;
  const cover = !profile || username === "anaoliveira" ? "/images/ana-fictional-cover.jpg" : null;
  return (
    <main className="profile-page">
      <div className="profile-cover">{cover && <Image src={cover} alt="Retrato ilustrativo de demonstração" fill priority sizes="100vw" />}<div className="cover-shade" /><span className="cover-label">FACELOVE / SPACE</span></div>
      <div className="profile-shell">
        <div className="profile-intro">
          <div className="profile-avatar">{cover ? <Image src={cover} fill sizes="(max-width: 700px) 92px, 130px" alt="Avatar ilustrativo" /> : <span className="avatar-initial">{displayName.slice(0,1)}</span>}</div>
          <div className="profile-actions">
            <button type="button" className="button button-primary" disabled title="Seguir estará disponível numa próxima fase"><UserPlus size={17} /> Seguir</button>
            <button type="button" className="button button-dark" disabled title="Mensagens estarão disponíveis numa próxima fase"><MessageCircle size={17} /> Mensagem</button>
            <Link href="/access" className="button button-dark private-action"><LockKeyhole size={16} /> Acesso privado</Link>
          </div>
          <div className="profile-identity">
            <p className="demo-kicker">{profile?.editorial_draft ? "PERFIL EM PREPARAÇÃO" : "FACELOVE SPACE"}</p>
            <h1>{displayName}</h1>
            <p className="username">@{username}</p>
            <p className="bio">{bio}</p>
            <div className="profile-details"><span><MapPin size={15} /> FaceLove Spaces</span>{access && <span className="access-badge"><LockKeyhole size={13} /> Convite ativo</span>}</div>
          </div>
        </div>
        <ProfileTabs posts={posts} assets={visibleAssets} packs={packs} access={access} live={live} mode={mode} bio={bio} author={displayName} username={username} />
      </div>
    </main>
  );
}
