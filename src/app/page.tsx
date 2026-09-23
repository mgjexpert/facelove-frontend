import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, LockKeyhole, Play } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <Image src="/images/ana-fictional-cover.jpg" alt="Retrato ficcional criado para demonstrar o FaceLove Spaces" fill priority sizes="100vw" className="hero-photo" />
        <div className="home-scrim" />
        <div className="home-content">
          <div className="hero-label"><span className="label-line" /> FACELOVE SPACES</div>
          <h1>Um espaço para<br /><em>estar mais perto.</em></h1>
          <p>Histórias, fotografias e vídeos num lugar só. Quem partilha escolhe o que é público e o que fica entre convidados.</p>
          <div className="hero-actions">
            <Link href="/@anaoliveira" className="button button-primary">Conhecer o Space de Ana <ArrowUpRight size={18} /></Link>
            <Link href="/spaces" className="button button-outline">Explorar Spaces</Link>
          </div>
        </div>
        <div className="hero-footnote">UMA EXPERIÊNCIA MAIS PESSOAL <span>01 / 01</span></div>
      </section>
      <section className="home-features">
        <div><Heart size={22} /><h2>O seu espaço</h2><p>Uma página com a sua voz, as suas publicações e o seu ritmo.</p></div>
        <div><Play size={22} /><h2>Histórias em movimento</h2><p>Fotografias e vídeos organizados para uma experiência fluida.</p></div>
        <div><LockKeyhole size={22} /><h2>Partilha à sua maneira</h2><p>Decida o que é público e o que precisa de convite.</p></div>
      </section>
    </main>
  );
}
