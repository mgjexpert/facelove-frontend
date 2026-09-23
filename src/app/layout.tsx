import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Compass, UserRound } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FaceLove Spaces",
  description: "Espaços pessoais para partilhar histórias, fotos e vídeos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>
        <header className="site-header">
          <Link className="wordmark" href="/" aria-label="FaceLove início">
            <span className="wordmark-icon"><Heart size={18} fill="currentColor" strokeWidth={1.6} /></span>
            Face<span>Love</span><i>.</i>
          </Link>
          <nav className="site-nav" aria-label="Navegação principal">
            <Link href="/spaces">Spaces</Link>
            <Link href="/@anaoliveira">Explorar perfil</Link>
          </nav>
          <Link className="header-action" href="/@anaoliveira"><UserRound size={16} /> Ver Space</Link>
        </header>
        {children}
        <nav className="mobile-nav" aria-label="Navegação móvel">
          <Link href="/"><Heart size={19} /><span>Início</span></Link>
          <Link href="/spaces"><Compass size={19} /><span>Spaces</span></Link>
          <Link href="/@anaoliveira"><UserRound size={19} /><span>Perfil</span></Link>
        </nav>
      </body>
    </html>
  );
}
