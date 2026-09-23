"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(form: FormData) {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email.includes("@") || !password) redirect("/login?error=credentials");
  const client = await createClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect("/dashboard");
}

export async function signUp(form: FormData) {
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (!email.includes("@") || password.length < 12) redirect("/signup?error=invalid");
  const client = await createClient();
  const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://facelove.online"}/auth/confirm` } });
  if (error) redirect("/signup?error=invalid");
  redirect("/signup?sent=1");
}

export async function signOut() {
  const client = await createClient();
  await client.auth.signOut();
  redirect("/login");
}
