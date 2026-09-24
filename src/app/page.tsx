import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, Images, LockKeyhole, Sparkles, Users, CalendarDays, Compass } from "lucide-react";
import { FaceLoveLogo } from "@/components/facelove-logo";
import { createClient } from "@/lib/supabase/server";
import { getProfiles, supabaseConfigured } from "@/lib/supabase-data";

const experiences = [
  { title: "Spaces", subtitle: "Histórias e espaços pessoais", icon: Images, ready: true },
  { title: "Community", subtitle: "Encontra a tua comunidade", icon: Users, ready: false },
  { title: "Dating", subtitle: "Conexões com intenção", icon: Heart, ready: false },
  { title: "Events", subtitle: "Experiências para viver", icon: CalendarDays, ready: false },
];
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profiles, signedIn] = await Promise.all([
    supabaseConfigured() ? getProfiles().catch(() => []) : Promise.resolve([]),
    supabaseConfigured() ? createClient().then(client => client.auth.getUser()).then(result => Boolean(result.data.user)).catch(() => false) : Promise.resolve(false),
  ]);
  return (
    <main>
      <section className="home-hero" aria-labelledby="hero-title">
        <Image src="/images/ana-fictional-cover.jpg" alt="Imagem ilustrativa de uma pessoa num ambiente cinematográfico" fill priority sizes="100vw" className="hero-photo" />
        <div className="home-scrim" />
        <div className="home-content">
          <div className="home-mark"><FaceLoveLogo expressive /></div>
          <p className="hero-label">PESSOAS REAIS <span>·</span> MOMENTOS REAIS <span>·</span> CONEXÕES REAIS</p>
          <h1 id="hero-title">Vive. Partilha.<br /><em>Conecta-te.</em></h1>
          <p>Descobre pessoas, histórias e espaços para te aproximares de quem faz a diferença. Aqui começam novas histórias.</p>
          <div className="hero-actions">
            <Link href={signedIn ? "/dashboard" : "/signup"} className="button button-primary">{signedIn ? "Ir para o meu FaceLove" : "Entrar no FaceLove"} <ArrowUpRight size={18} /></Link>
            <Link href="#discover" className="button button-outline">Explorar <Compass size={16} /></Link>
          </div>
        </div>
        <div className="hero-footnote">MAIS QUE UM APP. UM ECOSSISTEMA DE CONEXÕES. <span>FACELOVE.ONLINE</span></div>
      </section>

      <section className="ecosystem-section" id="discover">
        <div className="section-heading"><p className="eyebrow">O UNIVERSO FACELOVE</p><h2>Um universo. <em>Muitas formas de conectar.</em></h2>
          <p>Um lugar para seres tu, partilhares momentos e encontrares novas formas de estar perto.</p></div>
        <div className="ecosystem-grid">{experiences.map(item => <article className="ecosystem-card" key={item.title}>
          <div className="ecosystem-icon"><item.icon size={24} /></div>
          <span className={`experience-state ${item.ready ? "is-active" : ""}`}>{item.ready ? "DISPONÍVEL" : "EM PREPARAÇÃO"}</span>
          <h3>{item.title}</h3><p>{item.subtitle}</p>
          {item.ready && <Link className="experience-link" href="/spaces">Explorar Spaces <ArrowUpRight size={16} /></Link>}
        </article>)}</div>
      </section>

      <section className="people-section">
        <div className="section-heading"><p className="eyebrow">PESSOAS & HISTÓRIAS</p><h2>Descobre pessoas no <em>FaceLove.</em></h2>
          <p>Conhece os primeiros Spaces e as histórias que escolhem partilhar.</p></div>
        {profiles.length > 0 ? <div className="people-grid">{profiles.map(profile => <Link className="people-card" key={profile.id} href={`/@${profile.username}`}>
          <span className="people-avatar">{profile.display_name.slice(0, 1)}</span>
          <span className="people-description"><strong>{profile.display_name}</strong><small>@{profile.username}</small><span>{profile.bio || "Um novo Space no FaceLove."}</span></span>
          <ArrowUpRight size={20} aria-hidden="true" />
        </Link>)}</div> : <Link href="/spaces" className="button button-outline">Explorar Spaces <ArrowUpRight size={17} /></Link>}
      </section>

      <section className="home-story"><div className="home-story-image"><Image src="/images/ana-fictional-cover.jpg" alt="Retrato editorial ilustrativo do FaceLove Spaces" fill sizes="(max-width: 760px) 100vw, 55vw" /></div>
        <div className="home-story-copy"><p className="eyebrow">O TEU ESPAÇO, AS TUAS HISTÓRIAS</p><h2>Mais perto, <em>à tua maneira.</em></h2>
          <p>Publica o que queres mostrar. Organiza fotografias e vídeos em álbuns. Decide quem pode entrar nos momentos reservados.</p>
          <div className="story-points"><span><Sparkles size={17} /> Um perfil com identidade</span><span><Images size={17} /> Conteúdo em álbuns</span><span><LockKeyhole size={17} /> Convites com prazo e limites</span></div>
          <Link href="/spaces" className="button button-primary">Descobrir Spaces <ArrowUpRight size={18} /></Link></div></section>

      <section className="home-final"><p className="eyebrow">A VIDA ACONTECE FORA DO ECRÃ</p><h2>A tua próxima história <em>pode começar aqui.</em></h2>
        <p>O FaceLove começa com pessoas e espaços. Outras formas de conectar estão a caminho.</p>
        <div className="hero-actions"><Link href="/signup" className="button button-primary">Criar conta <ArrowUpRight size={18} /></Link>
          <Link href="/login" className="button button-outline">Já tenho conta</Link></div></section>
    </main>
  );
}
