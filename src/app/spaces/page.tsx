import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, Images, Video } from "lucide-react";
import { getProfiles, supabaseConfigured } from "@/lib/supabase-data";

export const metadata = { title: "Spaces · FaceLove" };
export const dynamic = "force-dynamic";
export default async function SpacesPage() {
  const profiles = supabaseConfigured() ? await getProfiles() : [];
  return (
    <main className="spaces-page">
      <section className="spaces-intro">
        <p className="eyebrow">FACELOVE / SPACES</p>
        <h1>Uma casa digital<br />com a <em>sua assinatura.</em></h1>
        <p>Partilhe posts, fotografias e vídeos no seu próprio espaço. Escolha o que todos podem ver e o que fica reservado a quem recebe um convite.</p>
        <Link href="/@anaoliveira" className="button button-primary">Explorar o Space de Ana <ArrowUpRight size={18} /></Link>
      </section>
      <Link href="/@anaoliveira" className="spaces-preview" aria-label="Abrir o Space de demonstração de Ana Oliveira">
        <div className="spaces-preview-cover"><Image src="/images/ana-fictional-cover.jpg" fill sizes="(max-width: 850px) 100vw, 550px" alt="" /></div>
        <div className="spaces-preview-info"><div className="preview-avatar"><Image src="/images/ana-fictional-cover.jpg" fill sizes="64px" alt="" /></div><div><strong>Ana Oliveira</strong><span>@anaoliveira · Space de demonstração</span></div><ArrowUpRight size={19} /></div>
      </Link>
      <div className="spaces-points">
        <div><Images size={20} /><span>Galerias e posts</span></div>
        <div><Video size={20} /><span>Vídeos com player</span></div>
        <div><LockKeyhole size={20} /><span>Convites privados</span></div>
      </div>
      {profiles.length > 0 && <section className="spaces-directory" aria-label="Spaces">
        <p className="eyebrow">DESCOBRIR SPACES</p><h2>Conheça os primeiros Spaces</h2>
        <div className="spaces-list">{profiles.map(profile =>
          <Link key={profile.id} href={`/@${profile.username}`} className="spaces-person">
            <span className="directory-avatar">{profile.display_name.slice(0, 1)}</span>
            <span><strong>{profile.display_name}</strong><small>@{profile.username} · Perfil em preparação</small></span>
            <ArrowUpRight size={18} />
          </Link>)}</div>
      </section>}
    </main>
  );
}
