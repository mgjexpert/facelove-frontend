"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
