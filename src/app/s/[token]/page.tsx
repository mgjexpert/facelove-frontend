import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, Timer } from "lucide-react";
import { accessTokenStatus } from "@/lib/access";
import { inspectInvite } from "@/lib/album-access";
import { publicRows, supabaseConfigured } from "@/lib/supabase-data";

export const metadata: Metadata = { title: "Convite privado · FaceLove", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await inspectInvite(token);
  const [album] = invite ? await publicRows<{title:string;space_id:string}>("albums", `id=eq.${invite.albumId}&select=title,space_id`) : [];
  const [space] = album ? await publicRows<{profile_id:string}>("spaces", `id=eq.${album.space_id}&select=profile_id`) : [];
  const [profile] = space ? await publicRows<{username:string;display_name:string}>("profiles", `id=eq.${space.profile_id}&select=username,display_name`) : [];
  const status = invite ? "valid" : supabaseConfigured() ? "invalid" : accessTokenStatus(token);
  return (
    <main className="center-page">
      <div className="access-panel">
        <div className="access-emblem">{status === "valid" ? <ShieldCheck size={26} /> : status === "expired" ? <Timer size={26} /> : <LockKeyhole size={26} />}</div>
        <p className="eyebrow">FACELOVE SPACES / CONVITE</p>
        <h1>{status === "valid" ? `Convite para ${profile?.display_name || "o Space de Ana"}${album ? ` · ${album.title}` : ""}` : status === "expired" ? "Este convite expirou" : "Convite não encontrado"}</h1>
        <p className="muted-copy">
          {status === "valid"
            ? invite ? `Acesso reservado ao álbum indicado${invite.expiresAt ? ` até ${new Date(invite.expiresAt).toLocaleDateString("pt-PT")}` : ". Sem data de expiração do convite"}.` : "Acesso de demonstração válido por até 24 horas após a ativação."
            : "Confirme o endereço recebido ou peça um novo convite a quem partilhou este Space."}
        </p>
        {status === "valid" ? (
          <form action="/api/access/activate" method="post">
            <input type="hidden" name="token" value={token} />
            <button className="button button-primary access-submit" type="submit">Ativar acesso <ArrowRight size={17} /></button>
          </form>
        ) : <Link className="button button-primary" href="/access">Introduzir outro convite <ArrowRight size={17} /></Link>}
        <Link className="quiet-link" href={`/@${profile?.username || "anaoliveira"}`}>Ver o perfil público</Link>
      </div>
    </main>
  );
}
