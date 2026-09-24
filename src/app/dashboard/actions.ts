"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { inviteGateway } from "@/lib/invite-manager";

async function ownedSpace() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await client.from("profiles").select("id,username").eq("owner_id", user.id).maybeSingle();
  if (!profile) redirect("/dashboard?unassigned=1");
  const { data: space } = await client.from("spaces").select("id").eq("profile_id", profile.id).maybeSingle();
  if (!space) throw new Error("Space não encontrado");
  return { client, profile, space };
}

export async function saveProfile(form: FormData) {
  const { client, profile } = await ownedSpace();
  const display_name = String(form.get("name") || "").trim().slice(0, 80);
  const bio = String(form.get("bio") || "").trim().slice(0, 500);
  if (!display_name) throw new Error("Nome obrigatório");
  const { error } = await client.from("profiles").update({ display_name, bio, editorial_draft: false }).eq("id", profile.id);
  if (error) throw new Error("Não foi possível guardar o perfil");
  revalidatePath(`/@${profile.username}`);
  redirect("/dashboard?saved=1");
}

export async function createPublicPost(form: FormData) {
  const { client, profile, space } = await ownedSpace();
  const caption = String(form.get("caption") || "").trim().slice(0, 3000);
  if (!caption) throw new Error("Texto obrigatório");
  const { error } = await client.from("posts").insert({ space_id: space.id, caption, visibility: "public", status: "published", published_at: new Date().toISOString() });
  if (error) throw new Error("Não foi possível publicar");
  revalidatePath(`/@${profile.username}`);
  redirect("/dashboard?published=1");
}

export async function renameAlbum(form: FormData) {
  const { client, profile, space } = await ownedSpace();
  const id = String(form.get("id") || "");
  const title = String(form.get("title") || "").trim().slice(0, 100);
  const description = String(form.get("description") || "").trim().slice(0, 500);
  if (!/^[a-f0-9-]{36}$/.test(id) || !title) throw new Error("Álbum inválido");
  const { error } = await client.from("albums").update({ title, description }).eq("id", id).eq("space_id", space.id);
  if (error) throw new Error("Não foi possível guardar o álbum");
  revalidatePath(`/@${profile.username}`);
  redirect("/dashboard?saved=1");
}

export async function createSpaceInvite(form: FormData): Promise<{ url?: string; error?: string }> {
  const { space } = await ownedSpace();
  const tier = String(form.get("tier") || "");
  const duration = String(form.get("duration") || "");
  const label = String(form.get("label") || "").trim().slice(0, 100);
  const maxUses = duration === "lifetime" ? null : Number(form.get("maxUses") || 1);
  if (!["guest", "vip", "vip_premium", "all_in"].includes(tier) ||
    !["5m", "12h", "24h", "7d", "1mo", "lifetime"].includes(duration) ||
    (duration !== "lifetime" && (!Number.isSafeInteger(maxUses) || maxUses! < 1 || maxUses! > 100))) return { error: "Selecione um nível e prazo válidos." };
  try {
    const result = await inviteGateway(space.id, "POST", false, { tier, duration, maxUses, label });
    revalidatePath("/dashboard");
    const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://facelove.online").replace(/\/$/, "");
    return { url: `${base}/s/${result.token}` };
  } catch { return { error: "Não foi possível criar o convite. Tente novamente." }; }
}

export async function revokeSpaceInvite(form: FormData) {
  const { space } = await ownedSpace();
  const id = String(form.get("id") || "");
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Convite inválido");
  await inviteGateway(space.id, "POST", true, { id });
  revalidatePath("/dashboard");
}
