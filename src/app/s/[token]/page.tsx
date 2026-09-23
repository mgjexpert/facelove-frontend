import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, Timer } from "lucide-react";
import { accessTokenStatus } from "@/lib/access";

export const metadata: Metadata = { title: "Convite privado · FaceLove", robots: { index: false, follow: false } };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const status = accessTokenStatus(token);
  return (
    <main className="center-page">
      <div className="access-panel">
        <div className="access-emblem">{status === "valid" ? <ShieldCheck size={26} /> : status === "expired" ? <Timer size={26} /> : <LockKeyhole size={26} />}</div>
        <p className="eyebrow">FACELOVE SPACES / CONVITE</p>
        <h1>{status === "valid" ? "Um convite para o Space de Ana" : status === "expired" ? "Este convite expirou" : "Convite não encontrado"}</h1>
        <p className="muted-copy">
          {status === "valid"
            ? "O acesso permite visualizar uma seleção reservada do Space de demonstração. O convite é válido por até 24 horas após a ativação."
            : "Confirme o endereço recebido ou peça um novo convite a quem partilhou este Space."}
        </p>
        {status === "valid" ? (
          <form action="/api/access/activate" method="post">
            <input type="hidden" name="token" value={token} />
            <button className="button button-primary access-submit" type="submit">Ativar acesso <ArrowRight size={17} /></button>
          </form>
        ) : <Link className="button button-primary" href="/access">Introduzir outro convite <ArrowRight size={17} /></Link>}
        <Link className="quiet-link" href="/@anaoliveira">Ver o perfil público</Link>
      </div>
    </main>
  );
}
