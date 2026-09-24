"use client";

import { useState, useTransition } from "react";
import { createSpaceInvite, revokeSpaceInvite } from "@/app/dashboard/actions";
import type { ManagedInvite } from "@/lib/invite-manager";

const tierNames: Record<string, string> = { guest: "Convidado · 30 fotos / 10 vídeos", vip: "VIP · 100 fotos / 20 vídeos",
  vip_premium: "VIP Premium · 200 fotos / 50 vídeos", all_in: "VIP ALL-IN · coleção completa" };

export function AccessStudio({ invites }: { invites: ManagedInvite[] }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return <section className="studio-access" id="acessos">
    <div className="studio-heading"><div><p className="eyebrow">FACELOVE STUDIO / ACESSOS</p><h2>Convites para o teu Space</h2>
      <p className="muted-copy">Uma chave abre vários álbuns, com limite de fotos, vídeos e prazo definido por ti.</p></div></div>
    <form className="studio-form" onSubmit={event => { event.preventDefault(); setError(""); setUrl("");
      const data = new FormData(event.currentTarget);
      startTransition(async () => { const result = await createSpaceInvite(data); if (result.error) setError(result.error); else setUrl(result.url || ""); });
    }}>
      <label>Nível<select name="tier" defaultValue="guest">{Object.entries(tierNames).map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label>
      <label>Prazo após ativação<select name="duration" defaultValue="7d">
        <option value="5m">Visita de cortesia · 5 minutos</option><option value="12h">12 horas</option><option value="24h">24 horas</option>
        <option value="7d">7 dias</option><option value="1mo">1 mês (30 dias)</option><option value="lifetime">Vitalício</option>
      </select></label>
      <label>Identificação<input name="label" maxLength={100} placeholder="Ex.: Convite para uma visita" /></label>
      <label>Ativações permitidas<input name="maxUses" type="number" min="1" max="100" defaultValue="1" /></label>
      <button type="submit" className="button button-primary" disabled={pending}>{pending ? "A criar…" : "Criar convite"}</button>
    </form>
    {error && <p role="alert" className="studio-error">{error}</p>}
    {url && <div className="studio-result" role="status"><strong>Guarda este link agora: só aparece uma vez.</strong>
      <input aria-label="Novo link privado" readOnly value={url} onFocus={event => event.currentTarget.select()} />
      <button type="button" className="button button-dark" onClick={() => navigator.clipboard.writeText(url)}>Copiar link</button></div>}
    <div className="studio-invites"><h3>Convites emitidos</h3>
      {invites.length ? invites.map(invite => <div className="studio-invite" key={invite.id}>
        <div><strong>{invite.label || tierNames[invite.tier] || "Acesso reservado"}</strong>
          <span>{tierNames[invite.tier] || invite.tier} · {invite.duration_seconds === 300 ? "5 min" : invite.duration_seconds === null ? "vitalício" : invite.duration_seconds === 2592000 ? "30 dias" : `${Math.round(invite.duration_seconds / 3600)} h`} · {invite.uses_count}/{invite.max_uses ?? "∞"} ativações</span>
          <span>Criado em {new Date(invite.created_at).toLocaleDateString("pt-PT", { timeZone: "UTC" })}{invite.activated_at ? ` · Ativado em ${new Date(invite.activated_at).toLocaleDateString("pt-PT", { timeZone: "UTC" })}` : " · À espera da primeira ativação"}</span></div>
        <div>{invite.revoked_at ? <span className="studio-disabled">Revogado</span> :
          <form action={revokeSpaceInvite}><input type="hidden" name="id" value={invite.id} /><button className="button button-dark" type="submit">Revogar</button></form>}</div>
      </div>) : <p className="muted-copy">Ainda não existem convites para o Space inteiro. Os convites antigos por álbum mantêm-se válidos.</p>}
    </div>
  </section>;
}
