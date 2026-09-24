import type { Metadata } from "next";
import Link from "next/link";
import { Compass, UserRound, Home } from "lucide-react";
import { FaceLoveLogo } from "@/components/facelove-logo";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase-data";
import "./globals.css";

export const metadata: Metadata = {
  title: "FaceLove Spaces",
  description: "Espaços pessoais para partilhar histórias, fotos e vídeos.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const signedIn = supabaseConfigured() ? Boolean((await (await createClient()).auth.getUser()).data.user) : false;
  return (
    <html lang="pt">
      <body>
        <header className="site-header">
          <FaceLoveLogo />
          <nav className="site-nav" aria-label="Navegação principal">
            <Link href="/spaces">Descobrir</Link>
            <Link href="/spaces">Spaces</Link>
            <span title="Em preparação">Community <small>em breve</small></span>
            <span title="Em preparação">Dating <small>em breve</small></span>
            <span title="Em preparação">Events <small>em breve</small></span>
          </nav>
          <div className="header-account">{!signedIn && <Link href="/login">Entrar</Link>}
            <Link className="header-action" href={signedIn ? "/dashboard" : "/signup"}><UserRound size={16} /> {signedIn ? "Studio" : "Criar conta"}</Link></div>
        </header>
        {children}
        <nav className="mobile-nav" aria-label="Navegação móvel">
          <Link href="/"><Home size={19} /><span>Início</span></Link>
          <Link href="/spaces"><Compass size={19} /><span>Descobrir</span></Link>
          <Link href={signedIn ? "/dashboard" : "/login"}><UserRound size={19} /><span>{signedIn ? "Studio" : "Entrar"}</span></Link>
        </nav>
      </body>
    </html>
  );
}
