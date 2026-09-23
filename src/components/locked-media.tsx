import Link from "next/link";
import { LockKeyhole, ArrowUpRight } from "lucide-react";
import type { Visibility } from "@/lib/media/types";

export function LockedMedia({ visibility }: { visibility: Visibility }) {
  return (
    <div className="locked-card">
      <div className="locked-emblem"><LockKeyhole size={23} /></div>
      <h3>Conteúdo privado</h3>
      <p>{visibility === "followers" ? "Disponível para seguidores quando esta função estiver ativa." : "Disponível através de convite."}</p>
      <Link href="/access" className="locked-link">Introduzir acesso <ArrowUpRight size={16} /></Link>
    </div>
  );
}
