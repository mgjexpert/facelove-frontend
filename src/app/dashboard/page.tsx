import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfile, createPublicPost, renameAlbum } from "./actions";
import { signOut } from "../login/actions";
import { inviteGateway, type ManagedInvite } from "@/lib/invite-manager";
import { AccessStudio } from "@/components/access-studio";

export const metadata = { title: "Dashboard · FaceLove", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await client.from("profiles").select("id,username,display_name,bio").eq("owner_id", user.id).maybeSingle();
  const { data: space } = profile ? await client.from("spaces").select("id").eq("profile_id", profile.id).maybeSingle() : { data: null };
  const { data: albums } = space ? await client.from("albums").select("id,title,description,media_type").eq("space_id", space.id).order("sort_order") : { data: [] };
  const invites: ManagedInvite[] | null = space ? await inviteGateway(space.id, "GET").catch(() => null) as ManagedInvite[] | null : null;
  return <main className="dashboard-page"><div className="dashboard-heading"><div><p className="eyebrow">FACELOVE / DASHBOARD</p>
    <h1>{profile ? `FaceLove Studio · ${profile.display_name}` : "Conta pendente"}</h1>
    <p className="muted-copy">{profile ? "Gira a apresentação e as publicações do seu Space." : "O seu email está confirmado. A equipa deve associar esta conta ao perfil certo antes de poder editar."}</p></div>
    <form action={signOut}><button className="button button-dark">Sair</button></form></div>
    {profile && <><Link className="quiet-link" href={`/@${profile.username}`}>Ver o meu Space →</Link>
      <div className="dashboard-grid"><section className="dashboard-card"><h2>Apresentação</h2><form action={saveProfile} className="account-form">
        <label>Nome<input name="name" defaultValue={profile.display_name} required maxLength={80} /></label>
        <label>Bio<textarea name="bio" defaultValue={profile.bio} maxLength={500} rows={4} /></label>
        <button className="button button-primary">Guardar apresentação</button></form></section>
      <section className="dashboard-card"><h2>Nova publicação pública</h2><form action={createPublicPost} className="account-form">
        <label>Texto<textarea name="caption" required rows={5} maxLength={3000} placeholder="Partilhe uma novidade..." /></label>
        <button className="button button-primary">Publicar</button></form></section></div>
      <h2 className="dashboard-subtitle">Álbuns privados</h2><div className="dashboard-grid">{albums?.map(album => <section className="dashboard-card" key={album.id}>
        <p className="eyebrow">{album.media_type === "image" ? "FOTOGRAFIAS" : "VÍDEOS"}</p>
        <form action={renameAlbum} className="account-form"><input name="id" type="hidden" value={album.id} />
          <label>Título<input name="title" defaultValue={album.title} required maxLength={100} /></label>
          <label>Descrição<textarea name="description" defaultValue={album.description} rows={2} maxLength={500} /></label>
          <button className="button button-dark">Guardar álbum</button></form></section>)}</div>
      {invites ? <AccessStudio invites={invites} /> : <p className="muted-copy">Gestão de convites temporariamente indisponível.</p>}
      <p className="muted-copy">A ligação das pastas continua administrada pela equipa. Convites gratuitos ou concedidos manualmente dão acesso sem pagamentos automáticos.</p>
    </>}
  </main>;
}
