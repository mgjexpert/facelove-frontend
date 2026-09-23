import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, LockKeyhole, MapPin, MessageCircle, UserPlus } from "lucide-react";
import ana from "../../../fixtures/ana-oliveira.json";
import { hasDemoAccess } from "@/lib/access";
import { getSpaceContent } from "@/lib/media/content";
import { canView } from "@/lib/media/fixture";
import { ProfileTabs } from "@/components/profile-tabs";

export const metadata = { title: "Ana Oliveira · FaceLove Spaces" };
export const dynamic = "force-dynamic";

export default async function AnaPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  if (decodeURIComponent(handle) !== "@anaoliveira") notFound();
  const access = await hasDemoAccess();
  const { assets, posts, live } = await getSpaceContent(access);
  const visibleAssets = assets.filter(asset => canView(asset.visibility, access));
  return (
    <main className="profile-page">
      <div className="profile-cover"><Image src="/images/ana-fictional-cover.jpg" alt="Retrato ficcional da identidade de demonstração Ana Oliveira" fill priority sizes="100vw" /><div className="cover-shade" /><span className="cover-label">FACELOVE / SPACE</span></div>
      <div className="profile-shell">
        <div className="profile-intro">
          <div className="profile-avatar"><Image src="/images/ana-fictional-cover.jpg" fill sizes="(max-width: 700px) 92px, 130px" alt="Avatar ficcional de Ana Oliveira" /></div>
          <div className="profile-actions">
            <button type="button" className="button button-primary" disabled title="Seguir estará disponível numa próxima fase"><UserPlus size={17} /> Seguir</button>
            <button type="button" className="button button-dark" disabled title="Mensagens estarão disponíveis numa próxima fase"><MessageCircle size={17} /> Mensagem</button>
            <Link href="/access" className="button button-dark private-action"><LockKeyhole size={16} /> Acesso privado</Link>
          </div>
          <div className="profile-identity">
            <p className="demo-kicker">SPACE DE DEMONSTRAÇÃO</p>
            <h1>{ana.profile.displayName} <BadgeCheck size={22} aria-label="Perfil de demonstração" /></h1>
            <p className="username">@{ana.profile.username}</p>
            <p className="bio">{ana.profile.bio}</p>
            <div className="profile-details"><span><MapPin size={15} /> {ana.profile.location}</span><span className="detail-dot" /><span>FaceLove Spaces</span>{access && <span className="access-badge"><LockKeyhole size={13} /> Convite ativo</span>}</div>
          </div>
        </div>
        <ProfileTabs posts={posts} assets={visibleAssets} access={access} live={live} bio={ana.profile.bio} />
      </div>
    </main>
  );
}
